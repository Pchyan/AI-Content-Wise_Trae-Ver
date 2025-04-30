import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Alert, FormControl, InputLabel, Select, MenuItem, Paper, Divider } from "@mui/material";

const LOCAL_KEY = "gemini_api_key";
const MODEL_KEY = "gemini_model";

export default function SettingPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-pro");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 可用的 Gemini 模型列表
  const availableModels = [
    { id: "gemini-pro", name: "Gemini Pro", description: "適合一般文字處理任務" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "進階推理能力，支援長文本" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "快速且多功能的模型" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "新一代功能，速度更快" },
    { id: "gemini-2.5-flash-preview", name: "Gemini 2.5 Flash Preview", description: "最新預覽版本，價格效能比最佳" },
    { id: "gemini-2.5-pro-preview", name: "Gemini 2.5 Pro Preview", description: "最強大的思考模型，最高回應準確度" }
  ];

  useEffect(() => {
    // 載入儲存的 API 金鑰
    const storedKey = localStorage.getItem(LOCAL_KEY);
    if (storedKey) setApiKey(storedKey);

    // 載入儲存的模型選擇
    const storedModel = localStorage.getItem(MODEL_KEY);
    if (storedModel) setModel(storedModel);
  }, []);

  const handleSave = () => {
    // 檢查 API 金鑰格式 (Google API 金鑰通常以 "AIza" 開頭)
    if (!apiKey || apiKey.length < 20 || !apiKey.startsWith('AIza')) {
      setError("請輸入有效的 Google Gemini API Key，金鑰應以 'AIza' 開頭。");
      setSaved(false);
      return;
    }

    // 儲存 API 金鑰和模型選擇
    localStorage.setItem(LOCAL_KEY, apiKey);
    localStorage.setItem(MODEL_KEY, model);
    setSaved(true);
    setError("");
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6} boxShadow={3} borderRadius={2} bgcolor="#fff" overflow="hidden">
      {/* API 金鑰設定區塊 */}
      <Paper elevation={0} sx={{ p: 3, borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">API 金鑰設定</Typography>
        <Typography variant="body2" mb={2} color="text.secondary">
          請輸入您的 Google Gemini API Key，僅儲存在本機瀏覽器，不會上傳伺服器。
        </Typography>
        <Box mb={2}>
          <Alert severity="info" sx={{ mb: 1, fontSize: 15, alignItems: 'center' }}>
            <strong>如何取得 API Key？</strong><br/>
            1. 前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a> 並登入 Google 帳號。<br/>
            2. 點擊「建立 API 金鑰」，複製產生的金鑰。<br/>
            3. 將金鑰貼到下方欄位並儲存。<br/>
            4. 注意：API 金鑰格式應為 "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"。<br/>
            5. 確保您的 API 金鑰已啟用 Gemini API 存取權限。
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
          placeholder="AIzaSy..."
          sx={{ letterSpacing: 1 }}
        />
      </Paper>

      {/* 模型選擇區塊 */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">模型選擇</Typography>
        <Typography variant="body2" mb={2} color="text.secondary">
          選擇您想使用的 Google Gemini 模型。不同模型有不同的特性和能力。
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="model-select-label">Gemini 模型</InputLabel>
          <Select
            labelId="model-select-label"
            value={model}
            label="Gemini 模型"
            onChange={e => setModel(e.target.value)}
          >
            {availableModels.map(m => (
              <MenuItem key={m.id} value={m.id}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{m.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.description}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={3}>
          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
          {saved && <Alert severity="success" sx={{ mb: 1 }}>已成功儲存！</Alert>}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
            sx={{ mt: 1, fontWeight: 700, fontSize: 17, py: 1.2 }}
            startIcon={<span className="material-icons">save</span>}
          >
            儲存設定
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}