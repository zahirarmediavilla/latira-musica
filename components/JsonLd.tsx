import type { LaEvent } from "@/lib/types";
import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/jsonld";

// Renders a Schema.org JSON-LD block. Server-rendered <script>; the payload is
// our own serialized data, so dangerouslySetInnerHTML is safe here.
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** MusicEvent + BreadcrumbList structured data for an event detail page. */
export function EventJsonLd({ event }: { event: LaEvent }) {
  const breadcrumb = buildBreadcrumbJsonLd(event);
  return (
    <>
      <JsonLd data={buildEventJsonLd(event)} />
      {breadcrumb && <JsonLd data={breadcrumb} />}
    </>
  );
}

/** Organization structured data for LaTira. */
export function OrganizationJsonLd() {
  return <JsonLd data={buildOrganizationJsonLd()} />;
}
