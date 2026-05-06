package com.kindkart.app.ui.screens.karma

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.kindkart.app.data.model.*
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KarmaScreen(
    navController: NavController,
    viewModel: KarmaViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    val haptic = LocalHapticFeedback.current

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().background(SurfaceBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // Title
            item {
                Text(
                    "Karma Marketplace",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                )
                Text(
                    "Give back. Grow together. 🌱",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextTertiary,
                )
            }

            // Karma Score Card
            item {
                PremiumCard {
                    Column(
                        modifier = Modifier.padding(20.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        AnimatedCircularProgress(
                            progress = state.profile.nextBadgeProgress,
                            size = 100.dp,
                            strokeWidth = 6.dp,
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CountUpText(
                                    targetValue = state.profile.totalKarma,
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = KindKartGreen,
                                )
                                Text(
                                    "KARMA",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextTertiary,
                                    letterSpacing = 1.sp,
                                )
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "Level ${state.profile.level}",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                        )
                        if (state.profile.nextBadgeName.isNotEmpty()) {
                            Text(
                                "Next: ${state.profile.nextBadgeName}",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextTertiary,
                            )
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(24.dp),
                        ) {
                            KarmaStatItem("${state.profile.donations}", "Donated", "🎁")
                            KarmaStatItem("${state.profile.helpsGiven}", "Helped", "🤝")
                            KarmaStatItem("${state.profile.exchanges}", "Exchanged", "🔄")
                        }
                    }
                }
            }

            // Streak
            item {
                PremiumCard {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        StreakFlame(streakDays = state.profile.streakDays)
                        AnimatedScaleButton(
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.toggleCreateSheet()
                            },
                            withHaptic = true,
                        ) {
                            Icon(Icons.Default.Add, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Post Listing", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // Badges
            item { SectionHeader("Badges") }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(state.profile.badges) { badge ->
                        AnimatedBadgeChip(
                            icon = badge.icon,
                            label = badge.name,
                            isUnlocked = badge.isUnlocked,
                        )
                    }
                }
            }

            // Tab Selector
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Feed", "Listings").forEachIndexed { idx, label ->
                        FilterChip(
                            selected = state.selectedTab == idx,
                            onClick = { viewModel.setTab(idx) },
                            label = { Text(label, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) },
                            shape = RoundedCornerShape(20.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = SurfaceCard,
                                selectedLabelColor = TextPrimary,
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = state.selectedTab == idx,
                                borderColor = SurfaceCardBorder,
                                selectedBorderColor = TextPrimary,
                            ),
                        )
                    }
                }
            }

            // Content based on tab
            when (state.selectedTab) {
                0 -> {
                    // Feed
                    if (state.activities.isEmpty()) {
                        item {
                            EmptyState(
                                icon = Icons.Outlined.VolunteerActivism,
                                title = "No karma activity yet",
                                description = "Be the first to spread kindness!",
                                actionLabel = "Post a listing",
                                onAction = { viewModel.toggleCreateSheet() },
                            )
                        }
                    } else {
                        itemsIndexed(state.activities) { index, activity ->
                            SlideInItem(index = index) {
                                KarmaActivityCard(activity = activity)
                            }
                        }
                    }
                }
                1 -> {
                    // Listings
                    if (state.listings.isEmpty()) {
                        item {
                            EmptyState(
                                icon = Icons.Outlined.Storefront,
                                title = "No listings yet",
                                description = "Post items to donate, exchange, or offer help.",
                                actionLabel = "Create Listing",
                                onAction = { viewModel.toggleCreateSheet() },
                            )
                        }
                    } else {
                        itemsIndexed(state.listings) { index, listing ->
                            SlideInItem(index = index) {
                                KarmaListingCard(listing = listing)
                            }
                        }
                    }
                }
            }

            item { Spacer(Modifier.height(16.dp)) }
        }

        // Floating appreciation message
        AppreciationMessage(
            message = state.successMessage,
            visible = state.showSuccessMessage,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 80.dp),
        )

        // Create listing bottom sheet
        if (state.showCreateSheet) {
            CreateKarmaListingSheet(
                onDismiss = { viewModel.toggleCreateSheet() },
                onCreate = { title, desc, cat -> viewModel.createListing(title, desc, cat) },
            )
        }
    }
}

// ===== Karma Stat Item =====
@Composable
private fun KarmaStatItem(value: String, label: String, icon: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(icon, fontSize = 20.sp)
        Spacer(Modifier.height(4.dp))
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
    }
}

// ===== Karma Activity Card =====
@Composable
private fun KarmaActivityCard(activity: KarmaActivity) {
    PremiumCard {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    UserAvatar(name = activity.userName, size = 36.dp)
                    Spacer(Modifier.width(10.dp))
                    Column {
                        Text(activity.userName, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                        Text(activity.action, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                    }
                }
                KindKartBadge(text = "+${activity.pointsEarned} ✨", variant = BadgeVariant.SUCCESS)
            }
            Spacer(Modifier.height(8.dp))
            Text(activity.listingTitle, style = MaterialTheme.typography.bodyMedium, color = TextPrimary)
            Spacer(Modifier.height(6.dp))
            Text(activity.message, style = MaterialTheme.typography.bodySmall, color = KindKartGreen, fontWeight = FontWeight.Medium)
        }
    }
}

// ===== Karma Listing Card =====
@Composable
private fun KarmaListingCard(listing: KarmaListing) {
    PremiumCard {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
            ) {
                Text(listing.title, style = MaterialTheme.typography.titleMedium, color = TextPrimary, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                KindKartBadge(
                    text = "${listing.category.icon} ${listing.category.label}",
                    variant = when (listing.category) {
                        KarmaCategory.DONATION -> BadgeVariant.SUCCESS
                        KarmaCategory.HELP -> BadgeVariant.WARNING
                        KarmaCategory.EXCHANGE -> BadgeVariant.INFO
                    }
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(listing.description, style = MaterialTheme.typography.bodySmall, color = TextTertiary, maxLines = 2)
            Spacer(Modifier.height(8.dp))
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("by ${listing.creatorName}", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                Text("+${listing.karmaPointsReward} karma", style = MaterialTheme.typography.labelSmall, color = KindKartGreen, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ===== Create Karma Listing Sheet =====
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateKarmaListingSheet(
    onDismiss: () -> Unit,
    onCreate: (String, String, KarmaCategory) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(KarmaCategory.DONATION) }
    val haptic = LocalHapticFeedback.current

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SurfaceCard,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                "Post a Karma Listing",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
            )
            Text(
                "Share kindness with your community 🌱",
                style = MaterialTheme.typography.bodySmall,
                color = TextTertiary,
            )

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title") },
                placeholder = { Text("What are you offering?") },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                placeholder = { Text("Provide more details...") },
                minLines = 3,
                maxLines = 5,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
            )

            Text("Category", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                KarmaCategory.entries.forEach { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = cat },
                        label = { Text("${cat.icon} ${cat.label}", fontSize = 13.sp) },
                        shape = RoundedCornerShape(20.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(cat.colorHex).copy(alpha = 0.12f),
                            selectedLabelColor = Color(cat.colorHex),
                        ),
                    )
                }
            }

            AnimatedScaleButton(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    onCreate(title, description, selectedCategory)
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = title.isNotBlank() && description.isNotBlank(),
                withHaptic = true,
            ) {
                Text("Post Listing ✨", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
        }
    }
}
