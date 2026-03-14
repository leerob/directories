import { redirect } from "next/navigation";

export default function Page() {
  redirect(
    "https://cursor.com/learn?utm_source=cursor-directory&utm_medium=referral&utm_campaign=learn-page",
  );
}
