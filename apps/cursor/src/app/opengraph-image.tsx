import {
  CursorIcon,
  createOGResponse,
  OG,
  OGLayout,
} from "@/lib/og";

export const alt = "Cursor Directory";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image() {
  return createOGResponse(
    <OGLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          flex: 1,
        }}
      >
        <CursorIcon size={80} />
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: OG.text,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Cursor Directory
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: OG.textSecondary,
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          Explore what the community is building
        </div>
      </div>
    </OGLayout>,
  );
}
