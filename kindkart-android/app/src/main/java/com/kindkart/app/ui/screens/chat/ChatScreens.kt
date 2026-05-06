package com.kindkart.app.ui.screens.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.kindkart.app.data.model.Conversation
import com.kindkart.app.data.model.Message
import com.kindkart.app.data.repository.ChatRepository
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.navigation.Routes
import com.kindkart.app.ui.theme.*
import com.kindkart.app.util.DemoData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ===== Chat ViewModel =====
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepo: ChatRepository,
) : ViewModel() {
    private val _conversations = MutableStateFlow<List<Conversation>>(emptyList())
    val conversations = _conversations.asStateFlow()
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages = _messages.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init { loadConversations() }

    fun loadConversations() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = chatRepo.getConversations()
            _conversations.value = result.getOrDefault(emptyList())
            _isLoading.value = false
        }
    }

    fun loadMessages(requestId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = chatRepo.getMessages(requestId)
            _messages.value = result.getOrDefault(emptyList())
            _isLoading.value = false
        }
    }
}

// ===== Chat List Screen =====
@Composable
fun ChatListScreen(navController: NavController, viewModel: ChatViewModel = hiltViewModel()) {
    val conversations by viewModel.conversations.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Text("Messages", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
            Spacer(Modifier.height(4.dp))
        }

        if (isLoading) {
            items(3) { ShimmerCard() }
        } else if (conversations.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Outlined.ChatBubbleOutline,
                    title = "No conversations yet",
                    description = "Start chatting by responding to a help request.",
                )
            }
        } else {
            items(conversations, key = { it.requestId }) { conv ->
                PremiumCard(interactive = true, onClick = { navController.navigate(Routes.chatThread(conv.requestId)) }) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        UserAvatar(name = conv.otherUser?.name ?: "U", size = 44.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(conv.otherUser?.name ?: "Unknown", style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                if (conv.unreadCount > 0) {
                                    KindKartBadge("${conv.unreadCount}", BadgeVariant.SUCCESS)
                                }
                            }
                            Spacer(Modifier.height(2.dp))
                            Text(
                                conv.lastMessage?.content ?: "",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextTertiary,
                                maxLines = 1,
                            )
                        }
                    }
                }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }
}

// ===== Chat Thread Screen =====
@Composable
fun ChatScreen(requestId: String, navController: NavController, viewModel: ChatViewModel = hiltViewModel()) {
    val messages by viewModel.messages.collectAsState()
    var inputText by remember { mutableStateOf("") }

    LaunchedEffect(requestId) { viewModel.loadMessages(requestId) }

    Column(modifier = Modifier.fillMaxSize().background(SurfaceBackground)) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth().background(SurfaceCard).padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Outlined.ArrowBack, "Back") }
            Text("Chat", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
        }

        // Messages
        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            reverseLayout = false,
        ) {
            items(messages, key = { it.id }) { msg ->
                val isMine = msg.senderId == "u1" || msg.senderId.startsWith("guest")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isMine) Arrangement.End else Arrangement.Start,
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isMine) KindKartGreen else SurfaceCard)
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                            .widthIn(max = 280.dp)
                    ) {
                        Column {
                            if (!isMine) {
                                Text(msg.sender?.name ?: "", style = MaterialTheme.typography.labelSmall, color = if (isMine) TextOnPrimary.copy(alpha = 0.7f) else KindKartGreen, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.height(2.dp))
                            }
                            Text(msg.content, style = MaterialTheme.typography.bodyMedium, color = if (isMine) TextOnPrimary else TextPrimary)
                        }
                    }
                }
            }
        }

        // Input
        Row(
            modifier = Modifier.fillMaxWidth().background(SurfaceCard).padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = inputText, onValueChange = { inputText = it },
                placeholder = { Text("Type a message...") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(24.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
            )
            Spacer(Modifier.width(8.dp))
            FilledIconButton(
                onClick = { inputText = "" },
                shape = RoundedCornerShape(14.dp),
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = KindKartGreen),
            ) { Icon(Icons.Default.Send, null, tint = TextOnPrimary) }
        }
    }
}
