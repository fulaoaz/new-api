package dto

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestClaudeTokenCountMetaIncludesJSONTools(t *testing.T) {
	var request ClaudeRequest
	require.NoError(t, common.Unmarshal([]byte(`{
		"model":"grok-chat-fast",
		"messages":[{"role":"user","content":"hello"}],
		"tools":[
			{"name":"read_fixture","description":"Read a fixture","input_schema":{"type":"object"}},
			{"type":"web_search_20250305","name":"web_search","user_location":{"type":"approximate","country":"CN"}}
		]
	}`), &request))

	meta := request.GetTokenCountMeta()
	require.NotNil(t, meta)
	assert.Equal(t, 2, meta.ToolsCount)
	assert.Contains(t, meta.CombineText, "read_fixture")
	assert.Contains(t, meta.CombineText, "Read a fixture")
	assert.Contains(t, meta.CombineText, `{"type":"object"}`)
	assert.Contains(t, meta.CombineText, "web_search")
	assert.Contains(t, meta.CombineText, `"country":"CN"`)
}
