import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Tabs, Tab, Alert, CircularProgress, Paper, useMediaQuery, Chip } from "@mui/material";
import axios from "axios";

const LOCAL_KEY = "gemini_api_key";
const MODEL_KEY = "gemini_model";

// 模型對應的 API 端點
const MODEL_ENDPOINTS = {
  "gemini-pro": "gemini-pro",
  "gemini-1.5-pro": "gemini-1.5-pro",
  "gemini-1.5-flash": "gemini-1.5-flash",
  "gemini-2.0-flash": "gemini-2.0-flash",
  "gemini-2.5-flash-preview": "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-preview": "gemini-2.5-pro-preview-03-25"
};

export default function MainPage() {
  const [tab, setTab] = useState(0);
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [currentModel, setCurrentModel] = useState("gemini-pro");

  // 載入使用者選擇的模型
  useEffect(() => {
    const storedModel = localStorage.getItem(MODEL_KEY);
    if (storedModel) {
      setCurrentModel(storedModel);
    }
  }, []);

  const handleTabChange = (_, v) => {
    setTab(v);
    setInput("");
    setUrl("");
    setSummary("");
    setComment("");
    setError("");
  };

  const fetchUrlContent = async (targetUrl) => {
    try {
      // 使用 allorigins CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const res = await axios.get(proxyUrl);
      const html = res.data.contents;
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body ? doc.body.innerText : "";
    } catch {
      throw new Error("無法取得網址內容，請確認網址正確且可公開存取。");
    }
  };

  const handleAnalyze = async () => {
    setError("");
    setSummary("");
    setComment("");
    const apiKey = localStorage.getItem(LOCAL_KEY);
    if (!apiKey || apiKey.length < 20 || !apiKey.startsWith('AIza')) {
      setError("請先於設定頁輸入有效的 Google Gemini API Key。金鑰應以 'AIza' 開頭。");
      return;
    }
    let content = "";
    if (tab === 0) {
      if (!input.trim()) {
        setError("請輸入文章內容。");
        return;
      }
      content = input.trim();
    } else {
      if (!url.trim()) {
        setError("請輸入網址。");
        return;
      }
      setLoading(true);
      try {
        content = await fetchUrlContent(url.trim());
        if (!content || content.length < 30) {
          setError("無法解析該網址內容或內容過短。");
          setLoading(false);
          return;
        }
      } catch (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
    }
    if (content.length > 160000) {
      setError("文章內容過長，請精簡後再試。");
      return;
    }
    setLoading(true);
    try {
      // 獲取當前選擇的模型端點
      const modelEndpoint = MODEL_ENDPOINTS[currentModel] || "gemini-pro";

      // 呼叫 Gemini API
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `請閱讀以下文章，並分別完成：\n1. 總結重點（簡短概述核心內容）\n2. 感想生成（針對內容給出評論或感想）\n\n文章：${content}` }] }]
        })
      });
      const data = await resp.json();

      // 檢查 API 回應是否包含錯誤訊息
      if (data.error) {
        console.error("API 錯誤:", data.error);
        throw new Error(`API 錯誤: ${data.error.message || "未知錯誤"}`);
      }

      // 檢查回應格式是否符合預期
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error("API 回應格式異常:", data);
        throw new Error("API 回應格式異常，請檢查金鑰或稍後再試。");
      }
      // 解析 Gemini 回應
      const text = data.candidates[0].content.parts[0].text;
      // 預設格式：1. 總結... 2. 感想...
      const match = text.match(/1[\.、．]\s*(.+?)2[\.、．]\s*(.+)/s);
      if (match) {
        setSummary(match[1].trim());
        setComment(match[2].trim());
      } else {
        setSummary(text);
        setComment("");
      }
    } catch (e) {
      setError(e.message || "分析失敗，請稍後再試。");
    }
    setLoading(false);
  };

  // 獲取模型顯示名稱
  const getModelDisplayName = () => {
    const modelId = currentModel;
    switch(modelId) {
      case "gemini-pro": return "Gemini Pro";
      case "gemini-1.5-pro": return "Gemini 1.5 Pro";
      case "gemini-1.5-flash": return "Gemini 1.5 Flash";
      case "gemini-2.0-flash": return "Gemini 2.0 Flash";
      case "gemini-2.5-flash-preview": return "Gemini 2.5 Flash Preview";
      case "gemini-2.5-pro-preview": return "Gemini 2.5 Pro Preview";
      default: return "Gemini";
    }
  };

  return (
    <Box maxWidth={700} mx="auto" mt={{ xs: 2, sm: 6 }} p={{ xs: 1, sm: 3 }} boxShadow={3} borderRadius={3} bgcolor="#fff" minHeight="80vh" sx={{ transition: 'box-shadow 0.3s', boxShadow: { xs: 1, sm: 3 } }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1, textAlign: "center", fontFamily: 'Noto Sans TC, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <span className="material-icons" style={{ fontSize: 36, color: '#1976d2', verticalAlign: 'middle' }}>insights</span>
          文萃智析（ContentWise）
        </Typography>
        <Chip
          label={`使用模型: ${getModelDisplayName()}`}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          icon={<span className="material-icons" style={{ fontSize: 16 }}>model_training</span>}
        />
      </Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2, borderRadius: 2, bgcolor: '#f5f7fa', minHeight: 48 }} centered variant="fullWidth">
        <Tab label={<><span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 4 }}>edit_note</span>貼上文章</>} sx={{ fontWeight: 700, fontSize: 17, minHeight: 48 }} />
        <Tab label={<><span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 4 }}>link</span>輸入網址</>} sx={{ fontWeight: 700, fontSize: 17, minHeight: 48 }} />
      </Tabs>
      {tab === 0 ? (
        <TextField
          label="請貼上文章內容"
          multiline
          minRows={6}
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          margin="normal"
          sx={{ bgcolor: "#f7f9fa", borderRadius: 2, fontSize: 17, letterSpacing: 1 }}
          placeholder="請將欲分析的文章內容貼於此處..."
        />
      ) : (
        <TextField
          label="請輸入文章網址"
          fullWidth
          value={url}
          onChange={e => setUrl(e.target.value)}
          margin="normal"
          sx={{ bgcolor: "#f7f9fa", borderRadius: 2, fontSize: 17, letterSpacing: 1 }}
          placeholder="https://example.com/article"
        />
      )}
      {error && <Alert severity="error" sx={{ mb: 1, fontSize: 16, alignItems: 'center' }}><span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 4 }}>error_outline</span>{error}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            py: 1.2,
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: 2,
            letterSpacing: 1,
            transition: 'background 0.2s'
          }}
          onClick={handleAnalyze}
          disabled={loading}
          startIcon={loading ? null : <span className="material-icons">analytics</span>}
        >
          {loading ? <CircularProgress size={24} /> : `使用 ${getModelDisplayName()} 分析`}
        </Button>
        <Typography variant="caption" color="text.secondary" align="center">
          可在設定頁面更改使用的模型
        </Typography>
      </Box>
      <Box mt={2} mb={1} display={{ xs: 'block', sm: 'none' }}>
        <Alert severity="info" sx={{ fontSize: 15, alignItems: 'center' }}>
          <span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 4 }}>touch_app</span>
          支援手機操作，請於上方選擇輸入方式。
        </Alert>
      </Box>
      {(summary || comment) && (
        <Box mt={4}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: "#f0f4fa", borderRadius: 3, boxShadow: { xs: 1, sm: 2 } }}>
            <Box display="flex" alignItems="center" mb={1}>
              <span className="material-icons" style={{ color: "#1976d2", marginRight: 8, fontSize: 28 }}>summarize</span>
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ letterSpacing: 1 }}>總結重點</Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: { xs: 17, sm: 18 }, lineHeight: 1.8, color: "#222", mb: comment ? 2 : 0, whiteSpace: 'pre-line' }}>{summary}</Typography>
          </Paper>
          {comment && (
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fffbe7", borderRadius: 3, boxShadow: { xs: 1, sm: 2 } }}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className="material-icons" style={{ color: "#f9a825", marginRight: 8, fontSize: 28 }}>emoji_objects</span>
                <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ letterSpacing: 1 }}>感想生成</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: { xs: 17, sm: 18 }, lineHeight: 1.8, color: "#444", whiteSpace: 'pre-line' }}>{comment}</Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}