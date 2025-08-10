import { Database } from "./supabase";

// 基本型定義
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type Image = Database["public"]["Tables"]["images"]["Row"];
export type ImageInsert = Database["public"]["Tables"]["images"]["Insert"];

// 関連データを含む複合型
export type PostWithImages = Post & {
  images: Image[];
};

export type PostWithUser = Post & {
  users: User;
};

export type PostWithAll = Post & {
  users: User;
  images: Image[];
};

// フォーム用の型
export type SignUpData = {
  email: string;
  password: string;
  username: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type CreatePostData = {
  content: string;
  images?: File[];
};
