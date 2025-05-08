# from sqlalchemy import create_engine, exc, text
import asyncio
import os
from typing import Annotated, Literal, Any
from typing_extensions import TypedDict
from langchain_openai import AzureChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.messages import ToolMessage, AIMessage, HumanMessage
from langchain_core.runnables import RunnableLambda, RunnableWithFallbacks
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate

from langgraph.prebuilt import ToolNode
from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import AnyMessage, add_messages, MessagesState
from langchain_community.agent_toolkits import SQLDatabaseToolkit

from langgraph.types import Command
from rich import print

from dotenv import load_dotenv

load_dotenv()

llm = AzureChatOpenAI(
    model=os.getenv("OPENAI_Deployment_Name"),
    api_version=os.getenv("OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
)


class State(MessagesState):
    called_tools: list[str] = []
    tool_results: dict[str, Any] = {}


@tool
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b


@tool
def subtract(a: int, b: int) -> int:
    """Subtract two numbers."""
    return a - b


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


@tool
def divide(a: int, b: int) -> int:
    """Divide two numbers."""
    if b == 0:
        raise ValueError("Cannot divide by zero.")
    return a / b


@tool
def web_search(query: str) -> str:
    """Perform a web search."""
    asyncio.sleep(2)
    # Placeholder for web search implementation
    return f"Results for '{query}' is not available for the moment"


tools = [
    add,
    subtract,
    multiply,
    divide,
    web_search,
]
llm_with_tools = llm.bind_tools(tools)

ToolNo = ToolNode(tools=tools)


def should_continue(state: State):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END


def call_model(state: State):
    messages = state["messages"]
    response = llm_with_tools.invoke(messages)
    return {
        "messages": [response],
    }


workflow = StateGraph(State)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNo)


workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

graph = workflow.compile()
