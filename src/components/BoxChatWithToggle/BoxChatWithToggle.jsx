import React, { useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Button, TextField, IconButton } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { motion } from "framer-motion";

const BoxChatWithToggle = () => {
  // Khai báo các state cần thiết
  const [isChatOpen, setIsChatOpen] = useState(false); // Trạng thái mở/đóng hộp chat
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [inputMessage, setInputMessage] = useState(""); // Nội dung tin nhắn người dùng nhập vào

  // Danh sách câu hỏi và câu trả lời tương ứng
  const qaPairs = [
    { question: "Khi nào tôi nhận được đơn hàng?", answer: "Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc." },
    { question: "Phí vận chuyển là bao nhiêu?", answer: "Phí vận chuyển sẽ được tính dựa trên địa chỉ giao hàng của bạn." },
    { question: "Sản phẩm này còn hàng không?", answer: "Sản phẩm hiện còn hàng tại kho." },
    { question: "Tôi có thể trả lại hàng không?", answer: "Bạn có thể trả lại hàng trong vòng 7 ngày kể từ khi nhận hàng." },
    { question: "Tôi muốn mua 1 lap top", answer: "Bạn muốn mua sản phẩm như nào? Vui lòng cho tôi biết thêm để tư vấn" },
  ];

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = (message) => {
    if (message.trim() === "") return; // Kiểm tra nếu tin nhắn rỗng
    setMessages([...messages, { type: "user", text: message }]); // Thêm tin nhắn của người dùng vào danh sách
    setInputMessage(""); // Xóa nội dung ô nhập
  };

  // Hàm xử lý khi chọn câu hỏi mẫu
  const handleQuestionClick = (question) => {
    const selectedQA = qaPairs.find((qa) => qa.question === question); // Tìm câu hỏi trong danh sách

    // Thêm câu hỏi của người dùng
    setMessages((prev) => [...prev, { type: "user", text: question }]);

    // Tự động trả lời với animation
    if (selectedQA) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", text: selectedQA.answer, animated: true }]);
      }, 1000); // Thêm độ trễ 1 giây cho phản hồi của bot
    }
  };

  return (
    <Box>
      {/* Nút bật/tắt hộp chat */}
      <IconButton
        onClick={() => setIsChatOpen(!isChatOpen)} // Đổi trạng thái mở/đóng hộp chat
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#1976d2",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#115293",
          },
        }}
      >
        <ChatIcon />
      </IconButton>

      {/* Hộp chat (ẩn/hiện) */}
      {isChatOpen && (
        <Box
          sx={{
            width: 400,
            maxHeight: 500,
            minHeight: 500,
            border: "1px solid #ccc",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f9f9f9",
            overflow: "hidden",
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 999,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              padding: 2,
              backgroundColor: "#1976d2",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <Typography variant="h6">Hỗ trợ khách hàng</Typography>
          </Box>

          {/* Danh sách tin nhắn */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: 2,
              display: "flex",
              flexDirection: "column",
              fontSize: "12px",
            }}
          >
            <List>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={msg.animated ? { opacity: 0, x: -50 } : false}
                  animate={msg.animated ? { opacity: 1, x: 0 } : false}
                  transition={{ duration: 0.5 }}
                >
                  <ListItem
                    sx={{
                      justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        padding: 1,
                        borderRadius: 2,
                        backgroundColor: msg.type === "user" ? "#1976d2" : "#e0e0e0",
                        color: msg.type === "user" ? "#fff" : "#000",
                        fontSize: "12px",
                      }}
                    >
                      <ListItemText primary={msg.text} sx={{ fontSize: "12px" }} />
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Box>

          {/* Câu hỏi mẫu */}
          <Box
            sx={{
              padding: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              backgroundColor: "#f1f1f1",
              maxHeight: 80, // Giới hạn chiều cao
              overflowY: "auto", // Bật scroll khi vượt chiều cao
            }}
          >
            {qaPairs.map((qa, index) => (
              <Button
                key={index}
                variant="text"
                size="small"
                onClick={() => handleQuestionClick(qa.question)}
                sx={{
                  fontSize: "12px",
                  padding: "4px 8px", // Giảm padding để nút nhỏ gọn hơn
                  textAlign: "left", // Căn trái để dễ đọc hơn
                }}
              >
                {qa.question}
              </Button>
            ))}
          </Box>

          {/* Input tin nhắn */}
          <Box
            sx={{
              padding: 1,
              borderTop: "1px solid #ccc",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)} // Cập nhật nội dung ô nhập
              inputProps={{ style: { fontSize: "12px" } }}
            />
            <Button
              variant="contained"
              onClick={() => handleSendMessage(inputMessage)} // Gửi tin nhắn khi nhấn nút
              sx={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Gửi
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BoxChatWithToggle;