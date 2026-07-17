package controller

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCountClaudeTokens(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/v1/messages/count_tokens", CountClaudeTokens)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(
		http.MethodPost,
		"/v1/messages/count_tokens",
		strings.NewReader(`{"model":"grok-chat-fast","system":"Be concise.","messages":[{"role":"user","content":"hello"}],"tools":[{"name":"read_fixture","description":"Read a fixture","input_schema":{"type":"object"}}]}`),
	)
	request.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code, recorder.Body.String())
	var response struct {
		InputTokens int `json:"input_tokens"`
	}
	require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &response))
	assert.Equal(t, 20, response.InputTokens)
}

func TestCountClaudeTokensRejectsMissingModel(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/v1/messages/count_tokens", CountClaudeTokens)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/v1/messages/count_tokens", strings.NewReader(`{"messages":[]}`))
	request.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusBadRequest, recorder.Code, recorder.Body.String())
	var response struct {
		Type  string `json:"type"`
		Error struct {
			Type    string `json:"type"`
			Message string `json:"message"`
		} `json:"error"`
	}
	require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &response))
	assert.Equal(t, "error", response.Type)
	assert.Equal(t, "invalid_request_error", response.Error.Type)
	assert.Equal(t, "model is required", response.Error.Message)
}
