"use client";
import { useEffect, useState } from "react";
import type { PresentationGateway } from "./gateway";
import type { Presentation } from "@/domain/presentations/models";
export function useStudio(gateway?: PresentationGateway) {
  const [user, setUser] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selected, setSelected] = useState<Presentation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const attempt = async (work: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
      return true;
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Request failed.");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    if (!gateway) return;
    setUser(await gateway.currentUser());
    setPresentations(await gateway.list());
  };
  useEffect(() => {
    if (!gateway) return;
    let active = true;
    gateway
      .currentUser()
      .then(async (id) => {
        if (!active) return;
        setUser(id);
        if (id) {
          const list = await gateway.list();
          if (active) setPresentations(list);
        }
      })
      .catch((problem) => {
        if (active) setError(problem.message);
      });
    return () => {
      active = false;
    };
  }, [gateway]);
  useEffect(() => {
    if (!gateway || !selected) return;
    let active = true;
    Promise.all(
      selected.assets
        .filter((a) => a.type.startsWith("image/"))
        .map(async (a) => [a.id, await gateway.assetUrl(a)] as const),
    )
      .then((pairs) => {
        if (active) setUrls(Object.fromEntries(pairs));
      })
      .catch(() => {
        if (active)
          setError(
            "Some uploaded images could not be loaded. Check storage access rules.",
          );
      });
    return () => {
      active = false;
    };
  }, [gateway, selected?.id, selected?.assets]);
  const replace = (p: Presentation) => {
    setSelected(p);
    setPresentations((current) => [
      p,
      ...current.filter((item) => item.id !== p.id),
    ]);
  };
  return {
    configured: !!gateway,
    user,
    presentations,
    selected,
    setSelected,
    busy,
    error,
    message,
    urls,
    login: (email: string, password: string) =>
      attempt(async () => {
        await gateway!.login(email, password);
        await refresh();
      }),
    signup: (email: string, password: string) =>
      attempt(async () => {
        await gateway!.signup(email, password);
        const id = await gateway!.currentUser();
        if (id) await refresh();
        else
          setMessage("Check your email to confirm your account, then sign in.");
      }),
    logout: () =>
      attempt(async () => {
        await gateway!.logout();
        setUser(null);
        setSelected(null);
        setPresentations([]);
        setUrls({});
      }),
    create: (title: string) =>
      attempt(async () => {
        replace(await gateway!.create(title));
      }),
    save: () =>
      attempt(async () => {
        if (selected) {
          replace(await gateway!.save(selected));
          setMessage("Presentation saved.");
        }
      }),
    upload: (files: File[]) =>
      attempt(async () => {
        if (!selected) return;
        let p = await gateway!.save(selected);
        for (const file of files) {
          const asset = await gateway!.upload(p, file);
          p = await gateway!.save({ ...p, assets: [...p.assets, asset] });
          replace(p);
        }
        setMessage("Files uploaded privately.");
      }),
    generate: () =>
      attempt(async () => {
        if (!selected) return;
        const saved = await gateway!.save(selected);
        replace(await gateway!.generate(saved));
        setMessage("Slides generated. Review and edit before downloading.");
      }),
    download: (format: "pptx" | "pdf") =>
      attempt(async () => {
        if (!selected) return;
        const p = await gateway!.save(selected);
        replace(p);
        await gateway!.download(p, format);
        setMessage(`${format.toUpperCase()} download ready.`);
      }),
  };
}
export type StudioController = ReturnType<typeof useStudio>;
