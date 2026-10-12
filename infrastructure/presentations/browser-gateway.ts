import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PresentationGateway } from "@/application/presentations/gateway";
import {
  allowedTypes,
  validatePresentation,
  type Presentation,
  type PresentationAsset,
} from "@/domain/presentations/models";
export class BrowserPresentationGateway implements PresentationGateway {
  private client: SupabaseClient;
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  async currentUser() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session?.user.id ?? null;
  }
  async login(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }
  async signup(email: string, password: string) {
    const { error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/presentations` },
    });
    if (error) throw error;
  }
  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
  async list() {
    const { data, error } = await this.client
      .from("presentations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error)
      throw new Error(
        "Could not load presentations. Confirm that the Supabase migration has been applied.",
      );
    return (data ?? []).map(validatePresentation);
  }
  async create(title: string) {
    const owner_id = await this.currentUser();
    if (!owner_id) throw new Error("Sign in first.");
    const { data, error } = await this.client
      .from("presentations")
      .insert({ owner_id, title, template: "Editorial" })
      .select()
      .single();
    if (error) throw error;
    return validatePresentation(data);
  }
  async save(p: Presentation) {
    validatePresentation(p);
    const { data, error } = await this.client
      .from("presentations")
      .update({
        title: p.title,
        template: p.template,
        notes: p.notes,
        assets: p.assets,
        slides: p.slides,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id)
      .eq("updated_at", p.updated_at)
      .select()
      .single();
    if (error) throw error;
    return validatePresentation(data);
  }
  async upload(p: Presentation, file: File) {
    if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024)
      throw new Error(
        "Upload PNG, JPG, WebP, TXT or PDF files up to 10 MB each.",
      );
    if (
      p.assets.length >= 12 ||
      p.assets.reduce((sum, a) => sum + a.size, file.size) > 25 * 1024 * 1024
    )
      throw new Error("Use up to 12 files and 25 MB per presentation.");
    const id = crypto.randomUUID();
    const extension = (
      {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "text/plain": "txt",
        "application/pdf": "pdf",
      } as Record<string, string>
    )[file.type];
    const path = `${p.owner_id}/${p.id}/${id}.${extension}`;
    const { error } = await this.client.storage
      .from("presentation-assets")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return { id, name: file.name, path, type: file.type, size: file.size };
  }
  async assetUrl(asset: PresentationAsset) {
    const { data, error } = await this.client.storage
      .from("presentation-assets")
      .createSignedUrl(asset.path, 600);
    if (error) throw error;
    return data.signedUrl;
  }
  private async request(path: string, body: unknown) {
    const { data } = await this.client.auth.getSession();
    if (!data.session) throw new Error("Sign in first.");
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let message = `The server could not complete this request (HTTP ${response.status}). Please try again.`;
      try {
        const problem = await response.json();
        if (typeof problem.error === "string" && problem.error.trim())
          message = problem.error;
      } catch {
        /* Gateways can return a non-JSON error page. */
      }
      throw new Error(message);
    }
    return response;
  }
  async generate(p: Presentation) {
    const response = await this.request("/api/presentations/generate", {
      id: p.id,
    });
    return validatePresentation(await response.json());
  }
  async download(p: Presentation, format: "pptx" | "pdf") {
    const response = await this.request("/api/presentations/export", {
      id: p.id,
      format,
    });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `${p.title.replace(/[^a-z0-9-]/gi, "_") || "presentation"}.${format}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
