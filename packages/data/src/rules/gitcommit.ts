export const gitcommitRules = [
  {
    title: "Git Commit Rules",
    tags: ["Git", "Commit", "VCS"],
    libs: ["Git", "VCS", "GitHub", "GitLab", "Bitbucket"],
    slug: "git-commit-cursor-rules",
    author: {
      name: "Lukas Wolfsteiner",
      url: "https://lukas.wolfsteiner.media/links/github?ref=cursor-rules",
      avatar: "https://lukas.wolfsteiner.media/assets/img/photo.jpg",
    },
    content: `
Commit Messages must have a short description that is less than 50 characters followed by a newline and a more detailed description.
- Commit message should have one of the following prefixes: "feat: ", "fix: ", "refactor: "
- Use markdown syntax
- Write concisely using an informal tone
- List significant changes
- Do not use specific names or files from the code
- Do not use phrases like "this commit", "this change", etc.
- Sentences in the detailed description should be separated by newlines
- Mention implications and possible usages of the code changes
- Do not respond as code with \`\`\` at the end of the message
    `
  },
];
