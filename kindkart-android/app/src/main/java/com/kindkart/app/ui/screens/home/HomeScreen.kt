package com.kindkart.app.ui.screens.home

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.navigation.Routes
import com.kindkart.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()

    // Parallax effect — scale the header based on scroll offset
    val firstVisibleItem by remember { derivedStateOf { listState.firstVisibleItemIndex } }
    val scrollOffset by remember { derivedStateOf { listState.firstVisibleItemScrollOffset } }
    val headerAlpha by remember { derivedStateOf { 1f - (scrollOffset / 600f).coerceIn(0f, 0.5f) } }
    val headerScale by remember { derivedStateOf { 1f - (scrollOffset / 2000f).coerceIn(0f, 0.1f) } }

    LaunchedEffect(isRefreshing) {
        if (isRefreshing) {
            viewModel.loadData()
            isRefreshing = false
        }
    }

    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = { isRefreshing = true },
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .background(SurfaceBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // ===== Parallax Welcome Banner =====
            item {
                PremiumCard(
                    modifier = Modifier.graphicsLayer(
                        alpha = if (firstVisibleItem == 0) headerAlpha else 1f,
                        scaleX = if (firstVisibleItem == 0) headerScale else 1f,
                        scaleY = if (firstVisibleItem == 0) headerScale else 1f,
                    )
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    listOf(
                                        KindKartGreen.copy(alpha = 0.08f),
                                        KindKartGreenLight.copy(alpha = 0.04f),
                                    )
                                )
                            )
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text("Good to see you,", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                            Spacer(Modifier.height(4.dp))
                            Text(
                                state.user?.name ?: "Neighbor",
                                style = MaterialTheme.typography.headlineMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.SemiBold,
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                if (state.isGuest) "Guest mode active" else "${state.communities.size} joined communities",
                                style = MaterialTheme.typography.labelMedium,
                                color = TextTertiary,
                            )
                            if (state.isDemoMode) {
                                Spacer(Modifier.height(8.dp))
                                KindKartBadge(text = "DEMO MODE", variant = BadgeVariant.WARNING)
                            }
                        }
                    }
                }
            }

            // ===== Daily Nudge =====
            item {
                NudgeCard(message = state.dailyNudge)
            }

            // ===== Animated Stats Row =====
            item {
                PremiumCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Live Snapshot", style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(12.dp))
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                        ) {
                            AnimatedStatColumn(value = viewModel.openRequestCount, label = "Open", icon = "📋")
                            AnimatedStatColumn(value = viewModel.resolvedRequestCount, label = "Resolved", icon = "✅")
                            AnimatedStatColumn(value = state.conversationCount, label = "Chats", icon = "💬")
                            AnimatedStatColumn(value = state.reputationScore ?: 0, label = "Trust", icon = "⭐")
                        }
                    }
                }
            }

            // ===== Smart Suggestions =====
            item {
                SectionHeader("Suggestions for you")
            }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    val suggestions = listOf(
                        Triple("🎁", "Donate items", "Have unused items? Help someone today."),
                        Triple("🤝", "Help nearby", "Someone in your community needs you."),
                        Triple("🌱", "Earn Karma", "Post a listing and earn karma points."),
                    )
                    items(suggestions) { (icon, title, desc) ->
                        SuggestionCard(icon = icon, title = title, description = desc, onClick = {
                            navController.navigate(Routes.KARMA)
                        })
                    }
                }
            }

            // ===== Quick Actions =====
            item {
                PremiumCard {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        AnimatedScaleButton(
                            onClick = { navController.navigate(Routes.CREATE_REQUEST) },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                        ) {
                            Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Post Request", fontWeight = FontWeight.SemiBold)
                        }
                        OutlinedButton(
                            onClick = { navController.navigate(Routes.CHAT) },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(24.dp),
                            border = ButtonDefaults.outlinedButtonBorder,
                        ) {
                            Icon(Icons.Outlined.ChatBubbleOutline, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Open Messages")
                        }
                        OutlinedButton(
                            onClick = { navController.navigate(Routes.COMMUNITIES) },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(24.dp),
                            border = ButtonDefaults.outlinedButtonBorder,
                        ) {
                            Icon(Icons.Outlined.People, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("View Groups")
                        }
                    }
                }
            }

            // Post prompt
            item {
                PremiumCard {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        UserAvatar(name = state.user?.name ?: "U")
                        Spacer(Modifier.width(12.dp))
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(24.dp))
                                .background(SurfaceMuted)
                                .clickable { navController.navigate(Routes.CREATE_REQUEST) }
                                .padding(horizontal = 16.dp, vertical = 12.dp)
                        ) {
                            Text("What does your neighborhood need?", color = TextTertiary, fontSize = 14.sp)
                        }
                    }
                }
            }

            // Filter chips
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val filters = listOf("For you", "Recent", "Needs help", "Resolved")
                    items(filters.size) { idx ->
                        FilterChip(
                            selected = idx == 0,
                            onClick = {},
                            label = { Text(filters[idx], fontSize = 13.sp, fontWeight = FontWeight.SemiBold) },
                            shape = RoundedCornerShape(20.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = SurfaceCard,
                                selectedLabelColor = TextPrimary,
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true, selected = idx == 0,
                                borderColor = SurfaceCardBorder,
                                selectedBorderColor = TextPrimary,
                            ),
                        )
                    }
                }
            }

            // Request feed with staggered entrance
            if (state.isLoading) {
                items(3) { ShimmerCard(modifier = Modifier.padding(vertical = 2.dp)) }
            } else if (state.requests.isEmpty()) {
                item {
                    EmptyState(
                        icon = Icons.Outlined.Search,
                        title = "No requests yet",
                        description = "Be the first to post or join a community.",
                        actionLabel = "Create your first request",
                        onAction = { navController.navigate(Routes.CREATE_REQUEST) },
                    )
                }
            } else {
                itemsIndexed(state.requests, key = { _, it -> it.id }) { index, request ->
                    SlideInItem(index = index) {
                        RequestFeedCard(
                            request = request,
                            onClick = { navController.navigate(Routes.requestDetail(request.id)) },
                        )
                    }
                }
            }

            // Communities sidebar
            item {
                Spacer(Modifier.height(8.dp))
                SectionHeader("Your neighborhood")
            }
            if (state.communities.isEmpty()) {
                item {
                    PremiumCard {
                        Text("You have not joined any communities yet.", style = MaterialTheme.typography.bodySmall, color = TextTertiary, modifier = Modifier.padding(16.dp))
                    }
                }
            } else {
                items(state.communities.take(5), key = { it.id }) { membership ->
                    PremiumCard(
                        interactive = true,
                        onClick = { navController.navigate(Routes.communityDetail(membership.community.id)) },
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(membership.community.name, style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                            Spacer(Modifier.height(2.dp))
                            Text("${membership.role} • ${membership.status}", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                    }
                }
            }

            // Safety card
            item {
                PremiumCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Trust and safety", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                        Spacer(Modifier.height(12.dp))
                        Card(
                            colors = CardDefaults.cardColors(containerColor = LandingAccentBg),
                            shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth(),
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(Icons.Outlined.Shield, null, tint = KindKartGreen, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Safety center online", style = MaterialTheme.typography.labelLarge, color = KindKartGreen, fontWeight = FontWeight.SemiBold)
                                    Text("Emergency workflows available", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                                }
                            }
                        }
                    }
                }
            }

            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

// ===== Animated Stat Column =====
@Composable
private fun AnimatedStatColumn(value: Int, label: String, icon: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(icon, fontSize = 18.sp)
        Spacer(Modifier.height(4.dp))
        CountUpText(
            targetValue = value,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
        )
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
    }
}

// ===== Suggestion Card =====
@Composable
private fun SuggestionCard(icon: String, title: String, description: String, onClick: () -> Unit) {
    PremiumCard(
        modifier = Modifier.width(200.dp),
        interactive = true,
        onClick = onClick,
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(icon, fontSize = 24.sp)
            Spacer(Modifier.height(8.dp))
            Text(title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(2.dp))
            Text(description, style = MaterialTheme.typography.labelSmall, color = TextTertiary, maxLines = 2)
        }
    }
}

// ===== Request Feed Card =====
@Composable
private fun RequestFeedCard(request: com.kindkart.app.data.model.HelpRequest, onClick: () -> Unit) {
    PremiumCard(interactive = true, onClick = onClick) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
            ) {
                Text(
                    request.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                Spacer(Modifier.width(8.dp))
                KindKartBadge(
                    text = request.status.uppercase(),
                    variant = when (request.status.lowercase()) {
                        "completed" -> BadgeVariant.SUCCESS
                        "accepted", "in_progress" -> BadgeVariant.INFO
                        else -> BadgeVariant.WARNING
                    }
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(
                request.description,
                style = MaterialTheme.typography.bodySmall,
                color = TextTertiary,
                maxLines = 2,
            )
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (request.category.isNotEmpty()) {
                    Text(request.category, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                }
                request.requester?.name?.let {
                    Text("• by $it", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                }
            }
        }
    }
}
