import { getCollectionByUserAndSlug } from "@/data/collections";
import { buildCollectionShareModel } from "@/lib/collection-share";
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

  const shareModel = buildCollectionShareModel(data);
  const displayLogos = shareModel.logos.slice(0, 5);
  const hasLogos = displayLogos.length > 0;

  return createOGResponse(
    <OGLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          width: "100%",
        }}
      >
        {hasLogos && (
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {displayLogos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  background: OG.cardBg,
                  border: `1px solid ${OG.border}`,
                  borderRadius: 20,
                  padding: 14,
                }}
              >
                <img
                  src={logo}
                  width={52}
                  height={52}
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
            {shareModel.itemCount > displayLogos.length && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  background: OG.cardBg,
                  border: `1px solid ${OG.border}`,
                  borderRadius: 20,
                  fontSize: 20,
                  fontWeight: 700,
                  color: OG.textTertiary,
                }}
              >
                +{shareModel.itemCount - displayLogos.length}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: OG.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            {shareModel.title}
          </div>

          {shareModel.shortDescription && (
            <div
              style={{
                fontSize: 24,
                color: OG.textTertiary,
                lineHeight: 1.4,
                maxWidth: 800,
              }}
            >
              {shareModel.shortDescription}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: OG.textSecondary,
          }}
        >
          {data.owner.image && (
            <img
              src={data.owner.image}
              width={40}
              height={40}
              style={{
                borderRadius: 10,
                border: `1px solid ${OG.border}`,
              }}
            />
          )}
          <span>{shareModel.ownerName}</span>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: OG.textTertiary,
            }}
          />
          <span>{shareModel.itemCount} items</span>
        </div>
      </div>
    </OGLayout>,
  );
}
