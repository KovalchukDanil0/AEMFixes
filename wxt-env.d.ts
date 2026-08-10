/// <reference types="svelte" />
/// <reference types="vite/client" />

namespace App {
  import type {
    EventName,
    Properties,
  } from "posthog-js/dist/module.no-external";

  type ColorProps = "green" | "red";

  interface ShowroomCode {
    data: Record<
      string,
      {
        code: string;
        name: string;
      }
    >;
  }

  interface ReferencesConfig {
    pages: {
      path: string;
    }[];
  }

  type MemeResponseType = Record<string, { path: string }>;

  type EnvTypes = "live" | "perf" | "prod" | "editor.html" | "cf#" | "jira";

  interface EventHandler<T> extends MouseEvent {
    currentTarget: EventTarget & T;
  }

  export interface PostHogProps {
    postHogEvent: EventName;
    postHogConfig: Properties;
  }
}

interface ImportMetaEnv {
  readonly VITE_LIVE_PERF_MATCH: string;
  readonly VITE_JIRA_MATCH: string;
  readonly VITE_AUTHOR_MATCH: string;
  readonly VITE_WF_PAGE_MATCH: string;
  readonly VITE_AEM_TOOLS_MATCH: string;
  readonly VITE_DAM_TREE_MATCH: string;
  readonly VITE_FIND_REPLACE_MATCH: string;

  readonly VITE_REGEX_JIRA: string;
  readonly VITE_REGEX_LIVE: string;
  readonly VITE_REGEX_PERF_PROD: string;
  readonly VITE_REGEX_AUTHOR: string;
  readonly VITE_REGEX_WORKFLOW: string;
  readonly VITE_REGEX_DAM_TREE_URL: string;
  readonly VITE_REGEX_WRONG_PAGES: string;
  readonly VITE_REGEX_FAST_AUTHOR: string;
  readonly VITE_REGEX_FIX_SITE_WIDE: string;
  readonly VITE_REGEX_IMAGE_PICKER: string;
  readonly VITE_REGEX_HTML_EXIST: string;
  readonly VITE_REGEX_WF_TITLE: string;
  readonly VITE_REGEX_DETERMINE_BETA: string;

  readonly VITE_FIND_REPLACE_URL: string;
  readonly VITE_DAM_TREE_URL: string;
  readonly VITE_DOMAIN: string;
  readonly VITE_DOMAIN_AUTHOR: string;
  readonly VITE_DOMAIN_PERF: string;
  readonly VITE_DOMAIN_PROD: string;
  readonly VITE_DOMAIN_TOP_LEVEL: string;
  readonly VITE_SECRET_WORD: string;
  readonly VITE_PATH_TO_RESOLVER: string;
  readonly VITE_PATH_TO_REFERENCES: string;
  readonly VITE_PATH_TO_REFERENCES_PARAMS: string;
  readonly VITE_FULL_AUTHOR_PATH: string;
  readonly VITE_PROPERTIES_PATH: string;
  readonly VITE_WORKFLOW_PATH: string;
  readonly VITE_JIRA_FULL_PATH: string;

  readonly VITE_POSTHOG_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
