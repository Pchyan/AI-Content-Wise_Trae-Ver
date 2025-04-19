import { useState } from "react";
import { Box, Button, TextField, Typography, Tabs, Tab, Alert, CircularProgress, Paper, useMediaQuery } from "@mui/material";
import axios from "axios";

const LOCAL_KEY = "gemini_api_key";

export default function MainPage() {
  const [tab, setTab] = useState(0);
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

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
    if (!apiKey || apiKey.length < 20) {
      setError("請先於設定頁輸入有效的 API Key。");
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
    if (content.length > 80000) {
      setError("文章內容過長，請精簡後再試。");
      return;
    }
    setLoading(true);
    try {
      // 呼叫 Gemini API
      const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `請閱讀以下文章，並分別完成：\n1. 總結重點（簡短概述核心內容）\n2. 感想生成（針對內容給出評論或感想）\n\n文章：${content}` }] }]
        })
      });
      const data = await resp.json();
      if (!data.candidates || !data.candidates[0].content.parts[0].text) {
        throw new Error("API 回應異常，請檢查金鑰或稍後再試。");
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

  return (
    <Box maxWidth={700} mx="auto" mt={{ xs: 2, sm: 6 }} p={{ xs: 1, sm: 3 }} boxShadow={3} borderRadius={3} bgcolor="#fff" minHeight="80vh">
      <Typography variant="h4" mb={2} fontWeight={700} color="primary.main" sx={{ letterSpacing: 1, textAlign: "center" }}>
        文萃智析（ContentWise）
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }} centered variant="fullWidth">
        <Tab label="貼上文章" />
        <Tab label="輸入網址" />
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
          sx={{ bgcolor: "#f7f9fa", borderRadius: 2 }}
        />
      ) : (
        <TextField
          label="請輸入文章網址"
          fullWidth
          value={url}
          onChange={e => setUrl(e.target.value)}
          margin="normal"
          sx={{ bgcolor: "#f7f9fa", borderRadius: 2 }}
        />
      )}
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 1, py: 1.2, fontSize: 18, fontWeight: 700, borderRadius: 2 }} onClick={handleAnalyze} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "分析"}
      </Button>
      {(summary || comment) && (
        <Box mt={4}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: "#f0f4fa", borderRadius: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <span className="material-icons" style={{ color: "#1976d2", marginRight: 8, fontSize: 28 }}>summarize</span>
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ letterSpacing: 1 }}>總結重點</Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: { xs: 17, sm: 18 }, lineHeight: 1.8, color: "#222", mb: comment ? 2 : 0 }}>{summary}</Typography>
          </Paper>
          {comment && (
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fffbe7", borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className="material-icons" style={{ color: "#f9a825", marginRight: 8, fontSize: 28 }}>emoji_objects</span>
                <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ letterSpacing: 1 }}>感想生成</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: { xs: 17, sm: 18 }, lineHeight: 1.8, color: "#444" }}>{comment}</Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}