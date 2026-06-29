import Link from "next/link";

import { Illustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/lib/i18n/server";

/** Custom 404 (also used when a civic case id is not found). */
export default function NotFound() {
  const t = getServerT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
      <Illustration name="search" size="lg" />
      <div className="space-y-1.5">
        <h1 className="text-h2">{t("notFound.title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("notFound.body")}
        </p>
      </div>
      <Button asChild>
        <Link href="/">{t("common.backToMap")}</Link>
      </Button>
    </div>
  );
}
