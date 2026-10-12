import type {
  Presentation,
  PresentationAsset,
} from "@/domain/presentations/models";
export interface PresentationGateway {
  currentUser(): Promise<string | null>;
  login(email: string, password: string): Promise<void>;
  signup(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  list(): Promise<Presentation[]>;
  create(title: string): Promise<Presentation>;
  save(presentation: Presentation): Promise<Presentation>;
  upload(presentation: Presentation, file: File): Promise<PresentationAsset>;
  assetUrl(asset: PresentationAsset): Promise<string>;
  generate(presentation: Presentation): Promise<Presentation>;
  download(presentation: Presentation, format: "pptx" | "pdf"): Promise<void>;
}
