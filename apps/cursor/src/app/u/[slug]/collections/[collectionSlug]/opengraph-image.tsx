import { getCollectionByUserAndSlug } from "@/data/collections";
import { dedupeCollectionLogos } from "@/lib/collections";
import { OG, OGLayout, createOGResponse } from "@/lib/og";

export const alt = "Collection";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>;
}) {
  const { slug, collectionSlug } = await params;
  const { data } = await getCollectionByUserAndSlug({
    ownerSlug: slug,
    collectionSlug,
  });

  if (!data) {
    return createOGResponse(
      <OGLayout>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: OG.text,
          }}
        >
          Collection not found
        </div>
      </OGLayout>,
    );
  }

  const logos = dedupeCollectionLogos(data.items, 6);

  return createOGResponse(
    <OGLayout>
      <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: OG.textSecondary,
            }}
          >
            {data.owner.image && (
              <img
                src={data.owner.image}
                width={42}
                height={42}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${OG.border}`,
                }}
              />
            )}
            <span>{data.owner.name}</span>
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: OG.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {data.title}
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 22,
              color: OG.textSecondary,
            }}
          >
            <span>{data.item_count} items</span>
            <span>{data.follower_count} followers</span>
          </div>

          {data.description && (
            <div
              style={{
                fontSize: 24,
                color: OG.textTertiary,
                lineHeight: 1.35,
                maxWidth: 620,
              }}
            >
              {data.description.length > 110
                ? `${data.description.slice(0, 110)}...`
                : data.description}
            </div>
          )}
        </div>

        <div
          style={{
            width: 340,
            height: 340,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {logos.length > 0 ? (
            logos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: OG.cardBg,
                  border: `1px solid ${OG.border}`,
                  borderRadius: 24,
                  padding: 18,
                }}
              >
                <img
                  src={logo}
                  width={72}
                  height={72}
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / span 3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: OG.cardBg,
                border: `1px solid ${OG.border}`,
                borderRadius: 24,
                color: OG.textSecondary,
                fontSize: 22,
              }}
            >
              Real plugin logos appear here
            </div>
          )}
        </div>
      </div>
    </OGLayout>,
  );
}
