import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const mcps1 = [
  {
    name: "Postmark",
    url: "https://cursor.directory/mcp/postmark-mcp",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/Postmark.webp",
  },
  {
    name: "Bucket",
    url: "https://cursor.directory/mcp/bucket",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/Bucket.webp",
  },
  {
    name: "Peekaboo",
    url: "https://cursor.directory/mcp/peekaboo",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/peekaboo.webp",
  },
  {
    name: "Postman",
    url: "https://cursor.directory/mcp/postman-mcp-server",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/Postman.webp",
  },
];

const mcps2 = [
  {
    name: "Mailtrap",
    url: "https://cursor.directory/mcp/mailtrap",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/Mailtrap.webp",
  },
  {
    name: "BrainGrid",
    url: "https://cursor.directory/mcp/braingrid",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/BrainGrid.webp",
  },
  {
    name: "GibsonAI",
    url: "https://cursor.directory/mcp/gibsonai",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/GibsonAI.webp",
  },
  {
    name: "Midday",
    url: "https://cursor.directory/mcp/midday",
    icon: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/mcps/Midday.webp",
  },
];

const posts = [
  {
    title: "Working with coding agents",
    description: "Tips for AI coding agents and prompting.",
    url: "https://anyblockers.com/posts/working-with-coding-agents",
  },
  {
    title: "Cursor Learn - Video Series",
    description: "Lee Robinson teaches AI-powered programming.",
    url: "https://cursor.directory/board",
  },
  {
    title: "Join the Cursor Community",
    description: "Share projects and connect with developers.",
    url: "https://cursor.directory/board",
  },
];

const popularPosts = [
  {
    title: "Mues AI - The Software Interaction Company",
    description: "Delegate tasks to AI agents in your product.",
    url: "https://cursor.directory/board",
  },
  {
    title: "3 killer prompt strategies for Cursor",
    description: "Advanced techniques from the community.",
    url: "https://cursor.directory/board",
  },
  {
    title: "Healz.ai - second opinions in minutes",
    description: "AI answers verified by licensed doctors.",
    url: "https://cursor.directory/board",
  },
];

const popularRules = [
  {
    title: "Next.js React TypeScript",
    description:
      "TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind",
    url: "https://cursor.directory/nextjs",
  },
  {
    title: "Expo React Native TypeScript",
    description:
      "TypeScript, React Native, Expo, and Mobile UI development with expo-router and react-navigation",
    url: "https://cursor.directory/expo-react-native-typescript-cursor-rules",
  },
  {
    title: "Laravel PHP",
    description:
      "Laravel, PHP, and web development with SOLID principles, Eloquent ORM, and best practices",
    url: "https://cursor.directory/laravel-cursor-rules",
  },
  {
    title: "FastAPI Python",
    description:
      "Python, FastAPI, and scalable API development with Pydantic and async operations",
    url: "https://cursor.directory/fastapi-python-cursor-rules",
  },
];

const Separator = () => (
  <Section
    style={{
      paddingLeft: "32px",
      paddingRight: "32px",
      paddingTop: "8px",
      paddingBottom: "16px",
    }}
  >
    <Row>
      <Column>
        <Img
          src="https://languine.ai/email/separator.png"
          alt="Separator"
          width="100%"
          className="mb-2"
        />
      </Column>
    </Row>
  </Section>
);

const Newsletter = () => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap');
              .mcp-row{white-space:nowrap!important}
              .mcp-col-5,.mcp-col-4{width:24%!important;max-width:24%!important;display:inline-block!important;box-sizing:border-box!important;vertical-align:top!important}
              .mcp-text{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
              
              @media only screen and (max-width: 600px) {
                .mcp-row{white-space:normal!important}
                .mcp-col-5,.mcp-col-4{width:48%!important;max-width:48%!important}
              }
            `}
          </style>
        </Head>
        <Body
          style={{
            backgroundColor: "#F6F8FA",
            fontFamily: "Geist, sans-serif",
          }}
        >
          <Container
            style={{
              backgroundColor: "#FFFFFF",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {/* Header with Logo */}
            <Section className="px-[32px] pt-[32px] pb-[24px]">
              <Row>
                <Column>
                  <Link href="https://cursor.directory">
                    <Img
                      src="https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/logo.png"
                      alt="Cursor Directory"
                      width="133"
                      height="12"
                      style={{ width: "133px", height: "12px" }}
                    />
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Greeting Section */}
            <Section className="px-[32px] pt-[16px] pb-[32px]">
              <Text className="text-[14px] text-[#666666] m-0 leading-[24px]">
                Here's what's trending in{" "}
                <Link
                  href="https://cursor.directory"
                  style={{
                    color: "#666666",
                    textDecoration: "underline",
                  }}
                >
                  Cursor Directory
                </Link>{" "}
                this month. Discover the most popular rules, MCPs, community
                posts and job opportunities in the Cursor ecosystem.
              </Text>
            </Section>

            {/* Featured MCPs - Horizontal List */}
            <Section className="px-[32px] pb-[32px]">
              <Row style={{ marginBottom: "10px" }}>
                <Column>
                  <Link
                    href="https://cursor.directory/mcp"
                    style={{
                      textDecoration: "none",
                      color: "#020304",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#020304",
                        margin: 0,
                      }}
                    >
                      Featured MCPs
                    </Text>
                  </Link>
                </Column>
              </Row>
              <Row
                className="mcp-row"
                style={{ fontSize: 0, whiteSpace: "nowrap" }}
              >
                {mcps1.map((mcp, index) => (
                  <Column
                    key={index.toString()}
                    className="mcp-col-5"
                    style={{
                      width: "24%",
                      maxWidth: "24%",
                      paddingLeft: index === 0 ? "0" : "4px",
                      paddingRight: index === mcps1.length - 1 ? "0" : "4px",
                      paddingBottom: "8px",
                      display: "inline-block",
                      verticalAlign: "top",
                      fontSize: "16px",
                    }}
                  >
                    <Link
                      href={mcp.url}
                      style={{ textDecoration: "none", color: "#020304" }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "50px",
                          width: "100%",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "10px",
                              paddingRight: "6px",
                              width: "28px",
                            }}
                          >
                            <Img
                              src={mcp.icon}
                              alt={mcp.name}
                              width="18"
                              height="18"
                              style={{
                                borderRadius: "50%",
                                display: "block",
                                width: "18px",
                                height: "18px",
                                maxWidth: "18px",
                                maxHeight: "18px",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              paddingLeft: "0",
                              fontSize: "12px",
                              color: "#020304",
                              fontWeight: 500,
                              fontFamily: "Geist, sans-serif",
                            }}
                          >
                            {mcp.name}
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
            </Section>

            {/* Featured Posts Grid */}
            <Section
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingBottom: "32px",
              }}
            >
              <Row style={{ marginBottom: "10px" }}>
                <Column>
                  <Link
                    href="https://cursor.directory/board"
                    style={{
                      textDecoration: "none",
                      color: "#020304",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#020304",
                        margin: 0,
                      }}
                    >
                      Featured Posts
                    </Text>
                  </Link>
                </Column>
              </Row>
              <Row>
                {posts.slice(0, 2).map((post, index) => (
                  <Column
                    key={index.toString()}
                    style={{
                      width: "50%",
                      paddingRight: index === 0 ? "8px" : "0",
                      paddingLeft: index === 0 ? "0" : "8px",
                    }}
                  >
                    <Link
                      href={post.url}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "#020304",
                      }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          width: "100%",
                          height: "100px",
                          tableLayout: "fixed",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingBottom: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#020304",
                                margin: 0,
                              }}
                            >
                              {post.title}
                            </Text>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingTop: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#666666",
                                margin: 0,
                                lineHeight: "18px",
                                display: "block",
                                overflow: "hidden",
                              }}
                            >
                              {post.description}
                            </Text>
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
              <Row>
                <Column>
                  <div style={{ height: "16px" }} />
                </Column>
              </Row>
              <Row>
                {posts.slice(2, 4).map((post, index) => (
                  <Column
                    key={index.toString()}
                    style={{
                      width: "50%",
                      paddingRight: index === 0 ? "8px" : "0",
                      paddingLeft: index === 0 ? "0" : "8px",
                    }}
                  >
                    <Link
                      href={post.url}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "#020304",
                      }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          width: "100%",
                          height: "100px",
                          tableLayout: "fixed",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingBottom: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#020304",
                                margin: 0,
                              }}
                            >
                              {post.title}
                            </Text>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingTop: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#666666",
                                margin: 0,
                                lineHeight: "18px",
                                display: "block",
                                overflow: "hidden",
                              }}
                            >
                              {post.description}
                            </Text>
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
            </Section>

            {/* <Separator /> */}
            {/* Popular Rules Grid */}
            {/* <Section
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingBottom: "32px",
              }}
            >
              <Row style={{ marginBottom: "24px" }}>
                <Column>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#020304",
                      margin: 0,
                    }}
                  >
                    Popular Rules
                  </Text>
                </Column>
                <Column align="right" style={{ textAlign: "right", width: "auto" }}>
                  <Link
                    href="https://cursor.directory/rules/popular"
                    style={{
                      fontSize: "14px",
                      color: "#666666",
                      textDecoration: "none",
                      display: "inline-block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View all →
                  </Link>
                </Column>
              </Row>
              <Row>
                {popularRules.slice(0, 2).map((rule, index) => (
                  <Column
                    key={index.toString()}
                    style={{
                      width: "50%",
                      paddingRight: index === 0 ? "8px" : "0",
                      paddingLeft: index === 0 ? "0" : "8px",
                    }}
                  >
                    <Link
                      href={rule.url}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "#020304",
                      }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          width: "100%",
                          height: "90px",
                          tableLayout: "fixed",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingBottom: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#020304",
                                margin: 0,
                              }}
                            >
                              {rule.title}
                            </Text>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingTop: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "10px",
                                color: "#666666",
                                margin: 0,
                                fontFamily: "Geist Mono, monospace",
                                lineHeight: "16px",
                                display: "block",
                                overflow: "hidden",
                              }}
                            >
                              {rule.description}
                            </Text>
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
              <Row>
                <Column>
                  <div style={{ height: "16px" }} />
                </Column>
              </Row>
              <Row>
                {popularRules.slice(2, 4).map((rule, index) => (
                  <Column
                    key={index.toString()}
                    style={{
                      width: "50%",
                      paddingRight: index === 0 ? "8px" : "0",
                      paddingLeft: index === 0 ? "0" : "8px",
                    }}
                  >
                    <Link
                      href={rule.url}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "#020304",
                      }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          width: "100%",
                          height: "90px",
                          tableLayout: "fixed",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingBottom: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#020304",
                                margin: 0,
                              }}
                            >
                              {rule.title}
                            </Text>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              paddingTop: "4px",
                              verticalAlign: "top",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: "10px",
                                color: "#666666",
                                margin: 0,
                                fontFamily: "Geist Mono, monospace",
                                lineHeight: "16px",
                                display: "block",
                                overflow: "hidden",
                              }}
                            >
                              {rule.description}
                            </Text>
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
            </Section> */}

            {/* <Separator /> */}

            {/* Popular MCPs Section */}
            <Section className="px-[32px] pb-[48px]">
              <Row style={{ marginBottom: "10px" }}>
                <Column style={{ marginBottom: 0 }}>
                  <Link
                    href="https://cursor.directory/mcp"
                    style={{
                      textDecoration: "none",
                      color: "#020304",
                      marginBottom: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#020304",
                        margin: 0,
                        marginBottom: 0,
                      }}
                    >
                      Featured MCPs
                    </Text>
                  </Link>
                </Column>
              </Row>
              <Row
                className="mcp-row"
                style={{ fontSize: 0, whiteSpace: "nowrap" }}
              >
                {mcps2.map((mcp, index) => (
                  <Column
                    key={index.toString()}
                    className="mcp-col-4"
                    style={{
                      width: "24%",
                      maxWidth: "24%",
                      paddingLeft: index === 0 ? "0" : "4px",
                      paddingRight: index === mcps2.length - 1 ? "0" : "4px",
                      paddingBottom: "8px",
                      display: "inline-block",
                      verticalAlign: "top",
                      fontSize: "16px",
                    }}
                  >
                    <Link
                      href={mcp.url}
                      style={{ textDecoration: "none", color: "#020304" }}
                    >
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        style={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "50px",
                          width: "100%",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "10px",
                              paddingRight: "6px",
                              width: "28px",
                            }}
                          >
                            <Img
                              src={mcp.icon}
                              alt={mcp.name}
                              width="18"
                              height="18"
                              style={{
                                borderRadius: "50%",
                                display: "block",
                                width: "18px",
                                height: "18px",
                                maxWidth: "18px",
                                maxHeight: "18px",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              paddingLeft: "0",
                              fontSize: "12px",
                              color: "#020304",
                              fontWeight: 500,
                              fontFamily: "Geist, sans-serif",
                            }}
                          >
                            {mcp.name}
                          </td>
                        </tr>
                      </table>
                    </Link>
                  </Column>
                ))}
              </Row>
            </Section>

            {/* Popular Posts List */}
            {/* <Section
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingBottom: "48px",
              }}
            >
              <Row style={{ marginBottom: "24px" }}>
                <Column>
                  <Link
                    href="https://cursor.directory/board"
                    style={{
                      textDecoration: "none",
                      color: "#020304",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#020304",
                        margin: 0,
                      }}
                    >
                      This Month's Popular Posts
                    </Text>
                  </Link>
                </Column>
              </Row>

              {popularPosts.map((post, index) => (
                <Link
                  key={index.toString()}
                  href={post.url}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "#020304",
                  }}
                >
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    style={{
                      width: "100%",
                      borderBottom: "1px solid #E5E7EB",
                      paddingBottom: "12px",
                    }}
                  >
                    <tr>
                      <td style={{ paddingBottom: "4px" }}>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#020304",
                            margin: 0,
                          }}
                        >
                          {index + 1}. {post.title}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingTop: "4px" }}>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666666",
                            margin: 0,
                            lineHeight: "18px",
                          }}
                        >
                          {post.description}
                        </Text>
                      </td>
                    </tr>
                  </table>
                </Link>
              ))}
            </Section> */}

            {/* Footer */}
            <Section
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "24px",
                paddingBottom: "24px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <Row style={{ marginBottom: "16px" }}>
                <Column>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    style={{ width: "auto" }}
                  >
                    <tr>
                      <td
                        style={{
                          paddingRight: "12px",
                          verticalAlign: "middle",
                        }}
                      >
                        <a
                          href="https://x.com/cursordirectory"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          <Img
                            src="https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/email/x.png"
                            alt="X (Twitter)"
                            width="20"
                            height="20"
                            style={{
                              width: "20px",
                              height: "20px",
                              display: "block",
                            }}
                          />
                        </a>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <a
                          href="https://github.com/pontusab/cursor.directory"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          <Img
                            src="https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/email/github.png"
                            alt="GitHub"
                            width="20"
                            height="20"
                            style={{
                              width: "20px",
                              height: "20px",
                              display: "block",
                            }}
                          />
                        </a>
                      </td>
                    </tr>
                  </table>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#666666",
                      margin: 0,
                    }}
                  >
                    © 2025 Cursor Directory. Made for the developer community.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Newsletter;
