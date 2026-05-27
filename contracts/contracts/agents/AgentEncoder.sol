// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentEncoder - ABI payload encoding helpers for Somnia base agents
/// @notice Each function returns the `payload` bytes expected by
///         IAgentRequester.createRequest / createAdvancedRequest.
library AgentEncoder {
    // ---------- LLM Inference ----------

    /// @notice Encode an inferString call (constrained or unconstrained text output)
    /// @param prompt User prompt
    /// @param systemPrompt System / instruction prompt
    /// @param chainOfThought Whether the model should reason step by step
    /// @param allowedValues Optional whitelist of accepted outputs. Empty = unconstrained.
    function encodeInferString(
        string memory prompt,
        string memory systemPrompt,
        bool chainOfThought,
        string[] memory allowedValues
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSignature(
            "inferString(string,string,bool,string[])",
            prompt,
            systemPrompt,
            chainOfThought,
            allowedValues
        );
    }

    /// @notice Encode an inferNumber call (bounded integer output)
    function encodeInferNumber(
        string memory prompt,
        string memory systemPrompt,
        int256 minValue,
        int256 maxValue,
        bool chainOfThought
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSignature(
            "inferNumber(string,string,int256,int256,bool)",
            prompt,
            systemPrompt,
            minValue,
            maxValue,
            chainOfThought
        );
    }

    /// @notice Encode an inferChat call (multi-turn conversation)
    /// @dev roles and messages MUST be the same length. Valid roles: "system","user","assistant".
    function encodeInferChat(
        string[] memory roles,
        string[] memory messages,
        bool chainOfThought
    ) internal pure returns (bytes memory) {
        require(roles.length == messages.length, "AgentEncoder: roles/messages length mismatch");
        return abi.encodeWithSignature(
            "inferChat(string[],string[],bool)",
            roles,
            messages,
            chainOfThought
        );
    }

    struct OnchainTool {
        string signature;
        string description;
    }

    /// @notice Encode an inferToolsChat call (LLM with MCP + on-chain tool calling)
    /// @dev Returns (string finishReason, string response, string[] updatedRoles,
    ///      string[] updatedMessages, string[] pendingToolCallIds, bytes[] pendingToolCalls)
    function encodeInferToolsChat(
        string[] memory roles,
        string[] memory messages,
        string[] memory mcpServerUrls,
        OnchainTool[] memory onchainTools,
        uint256 maxIterations,
        bool chainOfThought
    ) internal pure returns (bytes memory) {
        require(roles.length == messages.length, "AgentEncoder: roles/messages length mismatch");
        return abi.encodeWithSignature(
            "inferToolsChat(string[],string[],string[],(string,string)[],uint256,bool)",
            roles,
            messages,
            mcpServerUrls,
            onchainTools,
            maxIterations,
            chainOfThought
        );
    }

    // ---------- JSON API Request ----------

    /// @notice Fetch a string field via dot-selector (e.g., "data.items[0].name")
    function encodeFetchString(string memory url, string memory selector)
        internal pure returns (bytes memory)
    {
        return abi.encodeWithSignature("fetchString(string,string)", url, selector);
    }

    /// @notice Fetch a numeric field, multiplied by 10^decimals
    function encodeFetchUint(string memory url, string memory selector, uint256 decimals)
        internal pure returns (bytes memory)
    {
        return abi.encodeWithSignature(
            "fetchUint(string,string,uint256)", url, selector, decimals
        );
    }

    function encodeFetchBool(string memory url, string memory selector)
        internal pure returns (bytes memory)
    {
        return abi.encodeWithSignature("fetchBool(string,string)", url, selector);
    }

    // ---------- LLM Parse Website ----------

    /// @notice Extract a string field from a website (real browser, JS supported)
    /// @param resolveUrl If false, numPages is capped at 1
    function encodeExtractString(
        string memory key,
        string memory description,
        string[] memory options,
        string memory prompt,
        string memory url,
        bool resolveUrl,
        uint8 numPages
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSignature(
            "ExtractString(string,string,string[],string,string,bool,uint8)",
            key,
            description,
            options,
            prompt,
            url,
            resolveUrl,
            numPages
        );
    }

    function encodeExtractANumber(
        string memory key,
        string memory description,
        uint256 minValue,
        uint256 maxValue,
        string memory prompt,
        string memory url,
        bool resolveUrl,
        uint8 numPages
    ) internal pure returns (bytes memory) {
        return abi.encodeWithSignature(
            "ExtractANumber(string,string,uint256,uint256,string,string,bool,uint8)",
            key,
            description,
            minValue,
            maxValue,
            prompt,
            url,
            resolveUrl,
            numPages
        );
    }
}
