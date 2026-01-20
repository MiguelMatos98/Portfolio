const GITHUB_USERNAME = "MiguelMatos98";
const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  company: string | null;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  pushed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubPortfolioData {
  user: GitHubUser;
  repos: GitHubRepo[];
  topLanguages: { name: string; count: number }[];
  totalStars: number;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGitHubUser(username: string = GITHUB_USERNAME): Promise<GitHubUser> {
  return fetchJSON<GitHubUser>(`${GITHUB_API_BASE}/users/${username}`);
}

export async function fetchGitHubRepos(
  username: string = GITHUB_USERNAME,
  options: { sort?: "updated" | "pushed" | "created"; perPage?: number } = {}
): Promise<GitHubRepo[]> {
  const { sort = "pushed", perPage = 100 } = options;
  const repos = await fetchJSON<GitHubRepo[]>(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=${sort}&per_page=${perPage}`
  );

  // Filter out forks and sort by stars
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

export function calculateTopLanguages(repos: GitHubRepo[]): { name: string; count: number }[] {
  const languageCounts = new Map<string, number>();

  for (const repo of repos) {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
    }
  }

  return Array.from(languageCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

export async function fetchGitHubPortfolioData(
  username: string = GITHUB_USERNAME
): Promise<GitHubPortfolioData> {
  const [user, repos] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
  ]);

  return {
    user,
    repos,
    topLanguages: calculateTopLanguages(repos),
    totalStars: calculateTotalStars(repos),
  };
}
