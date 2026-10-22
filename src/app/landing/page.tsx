import { redirect } from "next/navigation";

/* Trang giới thiệu nay là trang chủ. Giữ địa chỉ cũ để link cũ vẫn chạy. */
export default function LandingAlias() {
  redirect("/");
}
