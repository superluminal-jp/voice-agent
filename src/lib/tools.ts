/**
 * Tools Module
 *
 * Centralized tool definitions for OpenAI Realtime API voice agent.
 * Includes both default hosted tools and custom function tools with localization support.
 *
 * Per OpenAI Agents SDK documentation:
 * - Default tools: webSearchTool, codeInterpreterTool, imageGenerationTool
 * - Custom tools: Use tool() helper with Zod schemas for strict validation
 *
 * @see https://openai.github.io/openai-agents-js/guides/tools/
 */

import { tool } from "@openai/agents/realtime";
import { z } from "zod";
import {
  selectFolder,
  indexFolder,
  search,
  isIndexed,
  isFileSystemAccessSupported,
  type SearchResult,
} from "./rag";

/**
 * Supported languages for tool responses
 */
export type ToolLanguage = "en" | "ja";

/**
 * Tool configuration interface
 */
export interface ToolConfig {
  enabled: boolean;
}

/**
 * All available tools
 */
export type ToolName =
  | "web_search"
  | "code_interpreter"
  | "image_generation"
  | "current_time"
  | "weather"
  | "rag";

/**
 * Tools configuration state
 */
export type ToolsConfig = Record<ToolName, boolean>;

/**
 * Default tools configuration (all enabled)
 */
export const DEFAULT_TOOLS_CONFIG: ToolsConfig = {
  web_search: true,
  code_interpreter: true,
  image_generation: true,
  current_time: true,
  weather: true,
  rag: true,
};

/**
 * Format current time response based on language
 *
 * @param date - Date object to format
 * @param timezone - IANA timezone string (optional)
 * @param language - Language for response formatting
 * @returns Localized time string
 */
function formatTimeResponse(
  date: Date,
  timezone: string | undefined,
  language: ToolLanguage
): string {
  try {
    // Format options for date/time
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || undefined,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };

    const formattedDate = new Intl.DateTimeFormat(
      language === "ja" ? "ja-JP" : "en-US",
      options
    ).format(date);

    // Localized response
    if (language === "ja") {
      const timezoneName = timezone
        ? ` (タイムゾーン: ${timezone})`
        : " (ローカルタイムゾーン)";
      return `現在の日時は${formattedDate}です${timezoneName}`;
    } else {
      const timezoneName = timezone
        ? ` (timezone: ${timezone})`
        : " (local timezone)";
      return `The current date and time is ${formattedDate}${timezoneName}`;
    }
  } catch (error) {
    console.error("[Tools] Error formatting time:", error);

    // Fallback to ISO string
    if (language === "ja") {
      return `現在の日時は${date.toISOString()}です`;
    } else {
      return `The current date and time is ${date.toISOString()}`;
    }
  }
}

/**
 * Format weather response based on language
 *
 * @param location - Location name
 * @param data - Weather data
 * @param language - Language for response formatting
 * @returns Localized weather description
 */
function formatWeatherResponse(
  location: string,
  data: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  },
  language: ToolLanguage
): string {
  const { temperature, condition, humidity, windSpeed } = data;

  if (language === "ja") {
    return `${location}の天気情報:
気温: ${temperature}°C
天候: ${condition}
湿度: ${humidity}%
風速: ${windSpeed} m/s`;
  } else {
    return `Weather information for ${location}:
Temperature: ${temperature}°C
Condition: ${condition}
Humidity: ${humidity}%
Wind Speed: ${windSpeed} m/s`;
  }
}

/**
 * Mock weather data generator
 * Per plan: Start with mock implementation, document how to add real API later
 *
 * To use a real weather API:
 * 1. Sign up for OpenWeatherMap API (https://openweathermap.org/api)
 * 2. Add NEXT_PUBLIC_WEATHER_API_KEY to .env.local
 * 3. Replace this function with real API call
 *
 * @param location - Location name
 * @returns Mock weather data
 */
function generateMockWeather(location: string) {
  // Generate realistic mock data based on location hash
  const hash = location
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const temperature = 15 + (hash % 20); // 15-35°C
  const conditions = [
    "Sunny",
    "Partly Cloudy",
    "Cloudy",
    "Rainy",
    "Clear",
    "Foggy",
  ];
  const conditionsJa = ["晴れ", "晴れ時々曇り", "曇り", "雨", "快晴", "霧"];

  const conditionIndex = hash % conditions.length;

  return {
    temperature,
    condition: conditions[conditionIndex],
    conditionJa: conditionsJa[conditionIndex],
    humidity: 40 + (hash % 40), // 40-80%
    windSpeed: 2 + (hash % 10), // 2-12 m/s
  };
}

/**
 * Create current time tool
 *
 * Returns the current date and time with localized response.
 * Supports optional timezone parameter for time conversion.
 *
 * Per OpenAI API: Use tool() helper with Zod schema for strict validation
 *
 * @param language - Language for response formatting
 * @returns Tool instance
 */
export function createCurrentTimeTool(language: ToolLanguage) {
  return tool({
    name: "get_current_time",
    description:
      language === "ja"
        ? "現在の日時を取得します。オプションでタイムゾーンを指定できます。"
        : "Get the current date and time. Optionally specify a timezone for conversion.",
    parameters: z.object({
      timezone: z
        .string()
        .nullable()
        .describe(
          language === "ja"
            ? "IANAタイムゾーン (例: Asia/Tokyo, America/New_York)。省略可能。"
            : "IANA timezone identifier (e.g., Asia/Tokyo, America/New_York). Optional."
        ),
    }),
    async execute({ timezone }) {
      // Log tool execution (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("[Tools] get_current_time called:", {
          timezone,
          language,
        });
      }

      const now = new Date();
      const response = formatTimeResponse(now, timezone ?? undefined, language);

      // Log response (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("[Tools] get_current_time response:", response);
      }

      return response;
    },
  });
}

/**
 * Create weather information tool
 *
 * Returns weather information for a specified location.
 * Currently uses mock data - see function comments for real API integration.
 *
 * Per OpenAI API: Use tool() helper with Zod schema for strict validation
 *
 * @param language - Language for response formatting
 * @returns Tool instance
 */
export function createWeatherTool(language: ToolLanguage) {
  return tool({
    name: "get_weather",
    description:
      language === "ja"
        ? "指定された場所の天気情報を取得します。気温、天候、湿度、風速を含みます。"
        : "Get weather information for a specified location. Includes temperature, conditions, humidity, and wind speed.",
    parameters: z.object({
      location: z
        .string()
        .describe(
          language === "ja"
            ? "場所の名前 (例: 東京, ニューヨーク, ロンドン)"
            : "Location name (e.g., Tokyo, New York, London)"
        ),
      unit: z
        .enum(["celsius", "fahrenheit"])
        .nullable()
        .describe(
          language === "ja"
            ? "温度の単位 (celsius または fahrenheit)。省略可能、デフォルトはcelsius。"
            : "Temperature unit (celsius or fahrenheit). Optional, defaults to celsius."
        ),
    }),
    async execute({ location, unit }) {
      // Default to celsius if unit is null
      const temperatureUnit = unit || "celsius";
      // Log tool execution (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("[Tools] get_weather called:", {
          location,
          unit: temperatureUnit,
          language,
        });
      }

      // Generate mock weather data
      // Per plan: Mock implementation for demo purposes
      const mockData = generateMockWeather(location);

      // Convert temperature if needed
      let temperature = mockData.temperature;
      if (temperatureUnit === "fahrenheit") {
        temperature = Math.round((temperature * 9) / 5 + 32);
      }

      // Use language-specific condition
      const condition =
        language === "ja" ? mockData.conditionJa : mockData.condition;

      const weatherData = {
        temperature,
        condition,
        humidity: mockData.humidity,
        windSpeed: mockData.windSpeed,
      };

      const response = formatWeatherResponse(location, weatherData, language);

      // Log response (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("[Tools] get_weather response:", response);
      }

      return response;
    },
  });
}

/**
 * Format RAG search results based on language
 *
 * @param query - Search query
 * @param results - Search results
 * @param language - Language for response formatting
 * @returns Localized search results description
 */
function formatRagResponse(
  query: string,
  results: SearchResult[],
  language: ToolLanguage
): string {
  if (results.length === 0) {
    return language === "ja"
      ? `"${query}"に関連する情報が見つかりませんでした。`
      : `No relevant information found for "${query}".`;
  }

  if (language === "ja") {
    let response = `"${query}"に関する検索結果 (${results.length}件):\n\n`;
    results.forEach((result, index) => {
      response += `[${index + 1}] ${result.chunk.fileName} (類似度: ${(
        result.score * 100
      ).toFixed(1)}%)\n`;
      response += `ファイル: ${result.chunk.filePath}\n`;
      response += `内容:\n${result.chunk.text}\n\n`;
    });
    return response;
  } else {
    let response = `Search results for "${query}" (${results.length} results):\n\n`;
    results.forEach((result, index) => {
      response += `[${index + 1}] ${result.chunk.fileName} (similarity: ${(
        result.score * 100
      ).toFixed(1)}%)\n`;
      response += `File: ${result.chunk.filePath}\n`;
      response += `Content:\n${result.chunk.text}\n\n`;
    });
    return response;
  }
}

/**
 * Create RAG (Retrieval-Augmented Generation) tool
 *
 * Searches through indexed local documents using semantic search.
 * If no folder is indexed, prompts user to select a folder first.
 *
 * Per OpenAI API: Use tool() helper with Zod schema for strict validation
 *
 * @param language - Language for response formatting
 * @returns Tool instance
 */
export function createRagTool(language: ToolLanguage) {
  return tool({
    name: "search_documents",
    description:
      language === "ja"
        ? "ローカルフォルダ内のドキュメントを意味検索で検索します。フォルダがインデックスされていない場合は、まずフォルダを選択する必要があります。"
        : "Search through indexed local documents using semantic search. If no folder is indexed, you need to select a folder first.",
    parameters: z.object({
      query: z
        .string()
        .describe(
          language === "ja"
            ? "検索クエリ (例: エラーハンドリングの方法, APIの使い方)"
            : "Search query (e.g., how to handle errors, API usage)"
        ),
    }),
    async execute({ query }) {
      // Log tool execution (development only)
      if (process.env.NODE_ENV === "development") {
        console.log("[Tools] search_documents called:", {
          query,
          language,
        });
      }

      try {
        // Check if folder is indexed
        if (!isIndexed()) {
          // Check if File System Access API is supported
          if (!isFileSystemAccessSupported()) {
            const errorMsg =
              language === "ja"
                ? "このブラウザではFile System Access APIがサポートされていません。Chrome、Edge、またはSafari 15.2+を使用してください。"
                : "File System Access API is not supported in this browser. Please use Chrome, Edge, or Safari 15.2+.";
            if (process.env.NODE_ENV === "development") {
              console.error("[Tools] search_documents error:", errorMsg);
            }
            return errorMsg;
          }

          // Prompt user to select folder
          const folderSelectMsg =
            language === "ja"
              ? "フォルダがインデックスされていません。検索するには、まずフォルダを選択してください。ブラウザでフォルダ選択ダイアログが表示されます。"
              : "No folder is indexed. To search, please select a folder first. A folder picker dialog will appear in your browser.";
          return folderSelectMsg;
        }

        // Perform search
        const results = await search(query, 5);

        const response = formatRagResponse(query, results, language);

        // Log response (development only)
        if (process.env.NODE_ENV === "development") {
          console.log("[Tools] search_documents response:", response);
        }

        return response;
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : language === "ja"
            ? "ドキュメント検索中にエラーが発生しました。"
            : "An error occurred while searching documents.";

        console.error("[Tools] search_documents error:", error);
        return errorMsg;
      }
    },
  });
}

/**
 * Get all enabled tools based on configuration
 *
 * Per OpenAI Agents SDK: Default tools are imported from '@openai/agents'
 * Note: For Realtime API, default tools may not be available yet.
 * This function prepares the structure for when they become available.
 *
 * @param config - Tools configuration
 * @param language - Language for custom tool responses
 * @returns Array of enabled tool instances
 */
export function getEnabledTools(
  config: ToolsConfig,
  language: ToolLanguage
): any[] {
  const tools: any[] = [];

  // Note: Default hosted tools (web_search, code_interpreter, image_generation)
  // may not be available in the Realtime API yet.
  // The imports would look like this when available:
  // import { webSearchTool, codeInterpreterTool, imageGenerationTool } from '@openai/agents';
  //
  // if (config.web_search) {
  //   tools.push(webSearchTool());
  // }
  // if (config.code_interpreter) {
  //   tools.push(codeInterpreterTool());
  // }
  // if (config.image_generation) {
  //   tools.push(imageGenerationTool());
  // }

  // For now, we'll log a warning if default tools are enabled
  if (
    process.env.NODE_ENV === "development" &&
    (config.web_search || config.code_interpreter || config.image_generation)
  ) {
    console.warn(
      "[Tools] Default hosted tools (web_search, code_interpreter, image_generation) may not be available in Realtime API yet. Check SDK documentation for updates."
    );
  }

  // Custom tools (always available)
  if (config.current_time) {
    tools.push(createCurrentTimeTool(language));
  }

  if (config.weather) {
    tools.push(createWeatherTool(language));
  }

  if (config.rag) {
    tools.push(createRagTool(language));
  }

  return tools;
}

/**
 * Get tool display name for UI
 *
 * @param toolName - Tool identifier
 * @param language - Language for display name
 * @returns Localized display name
 */
export function getToolDisplayName(
  toolName: string,
  language: ToolLanguage
): string {
  const displayNames: Record<string, Record<ToolLanguage, string>> = {
    get_current_time: {
      en: "Current Time",
      ja: "現在時刻",
    },
    get_weather: {
      en: "Weather Information",
      ja: "天気情報",
    },
    search_documents: {
      en: "Document Search (RAG)",
      ja: "ドキュメント検索 (RAG)",
    },
    web_search: {
      en: "Web Search",
      ja: "ウェブ検索",
    },
    code_interpreter: {
      en: "Code Interpreter",
      ja: "コードインタープリター",
    },
    image_generation: {
      en: "Image Generation",
      ja: "画像生成",
    },
  };

  return displayNames[toolName]?.[language] || toolName;
}

/**
 * Get tool icon emoji for UI
 *
 * @param toolName - Tool identifier
 * @returns Icon emoji
 */
export function getToolIcon(toolName: string): string {
  const icons: Record<string, string> = {
    get_current_time: "⏰",
    get_weather: "🌤️",
    search_documents: "📚",
    web_search: "🔍",
    code_interpreter: "💻",
    image_generation: "🎨",
  };

  return icons[toolName] || "🔧";
}
