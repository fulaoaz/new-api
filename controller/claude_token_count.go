package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

// CountClaudeTokens implements Anthropic's local input-token counting contract.
// Authentication is handled by the relay router's TokenAuth middleware.
func CountClaudeTokens(c *gin.Context) {
	var request dto.ClaudeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		claudeTokenCountError(c, "invalid JSON request body")
		return
	}
	if request.Model == "" {
		claudeTokenCountError(c, "model is required")
		return
	}

	meta := request.GetTokenCountMeta()
	inputTokens := service.CountTextToken(meta.CombineText, request.Model)
	for _, file := range meta.Files {
		switch file.FileType {
		case types.FileTypeImage:
			inputTokens += 520
		case types.FileTypeAudio:
			inputTokens += 256
		case types.FileTypeVideo:
			inputTokens += 4096 * 2
		default:
			inputTokens += 4096
		}
	}

	c.JSON(http.StatusOK, gin.H{"input_tokens": inputTokens})
}

func claudeTokenCountError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"type": "error",
		"error": gin.H{
			"type":    "invalid_request_error",
			"message": message,
		},
	})
}
