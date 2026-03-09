"use client";

import { RefreshCw, Save, WandSparkles } from "lucide-react";
import { SearchableModelSelect } from "../components/SearchableModelSelect";
import { useAISettings } from "../hooks/useAISettings";

export function SettingsPage() {
  const { settings, modelOptions, loading, error, updateSettings, refreshModels } = useAISettings();

  return (
    <section style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 20 }}>
      <div>
        <div className="chip">Local-first configuration</div>
        <h1 className="serif-title" style={{ fontSize: "clamp(2.2rem, 5vw, 4.4rem)", margin: "16px 0 8px" }}>
          设置
        </h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          AI 配置保存在本地浏览器。首次加载时会从 `.env` 的 `DEFAUT_API_KEY` 和 `DEFAULT_AI_MODELS` 读取默认值。
        </p>
      </div>

      <div className="panel" style={{ padding: 28, display: "grid", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WandSparkles size={18} />
          <strong>AI 设置</strong>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>API Key</div>
          <input
            className="input"
            type="password"
            value={settings?.apiKey || ""}
            onChange={(event) =>
              settings &&
              updateSettings((current) => ({
                ...current,
                apiKey: event.target.value,
              }))
            }
            placeholder="OpenRouter API key"
            disabled={loading || !settings}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>模型选择</div>
          <SearchableModelSelect
            options={modelOptions}
            value={settings?.selectedModel || ""}
            onChange={(value) =>
              settings &&
              updateSettings((current) => ({
                ...current,
                selectedModel: value,
              }))
            }
          />
          <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 14 }}>
            可搜索。点击“获取模型”后会用当前 API key 从 OpenRouter 拉取可用模型列表。
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void refreshModels(settings?.apiKey)}
            disabled={loading || !settings}
          >
            <RefreshCw size={16} />
            获取模型
          </button>
          <div className="btn btn-secondary" style={{ cursor: "default" }}>
            <Save size={16} />
            已自动保存到本地
          </div>
        </div>

        {error ? <div style={{ color: "#a33b20" }}>{error}</div> : null}
      </div>
    </section>
  );
}
