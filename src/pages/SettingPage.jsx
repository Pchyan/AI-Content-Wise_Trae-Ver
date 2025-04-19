import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

const LOCAL_KEY = "gemini_api_key";

export default function SettingPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    if (!apiKey || apiKey.length < 20) {
      setError("請輸入有效的 Google Gemini API Key。");
      setSaved(false);
      return;
    }
    localStorage.setItem(LOCAL_KEY, apiKey);
    setSaved(true);
    setError("");
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">API 金鑰設定</Typography>
      <Typography variant="body2" mb={2} color="text.secondary">
        請輸入您的 Google Gemini API Key，僅儲存在本機瀏覽器，不會上傳伺服器。
      </Typography>
      <Box mb={2}>
        <Alert severity="info" sx={{ mb: 1, fontSize: 15, alignItems: 'center' }}>
          <strong>如何取得 API Key？</strong><br/>
          1. 前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a> 並登入 Google 帳號。<br/>
          2. 點擊「建立 API 金鑰」，複製產生的金鑰。<br/>
          3. 將金鑰貼到下方欄位並儲存。
        </Alert>
      </Box>
      <TextField
        label="Google Gemini API Key"
        variant="outlined"
        fullWidth
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        autoComplete="off"
        margin="normal"
        placeholder="sk-..."
        sx={{ letterSpacing: 1 }}
      />
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 1 }}>已成功儲存！</Alert>}
      <Button variant="contained" color="primary" fullWidth onClick={handleSave} sx={{ mt: 1, fontWeight: 700, fontSize: 17, py: 1 }}>
        儲存
      </Button>
    </Box>
  );
}