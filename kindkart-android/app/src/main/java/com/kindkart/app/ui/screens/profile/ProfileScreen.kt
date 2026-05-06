package com.kindkart.app.ui.screens.profile

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.data.rbac.RbacManager
import com.kindkart.app.data.rbac.UserRole
import com.kindkart.app.data.repository.AuthRepository
import com.kindkart.app.data.repository.KarmaRepository
import com.kindkart.app.data.repository.ReputationRepository
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.navigation.Routes
import com.kindkart.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepo: AuthRepository,
    private val repRepo: ReputationRepository,
    private val karmaRepo: KarmaRepository,
    private val rbacManager: RbacManager,
    private val prefs: UserPreferences,
) : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user = _user.asStateFlow()
    private val _reputation = MutableStateFlow(com.kindkart.app.util.DemoData.reputationInfo)
    val reputation = _reputation.asStateFlow()
    private val _badges = MutableStateFlow(com.kindkart.app.util.DemoData.badges)
    val badges = _badges.asStateFlow()
    private val _leaderboard = MutableStateFlow(com.kindkart.app.util.DemoData.leaderboard)
    val leaderboard = _leaderboard.asStateFlow()
    private val _role = MutableStateFlow(UserRole.USER)
    val role = _role.asStateFlow()

    val karmaProfile = karmaRepo.profile

    init { loadProfile() }

    fun loadProfile() {
        viewModelScope.launch {
            _user.value = prefs.currentUser.firstOrNull()
            rbacManager.currentRole.collect { _role.value = it }
        }
        viewModelScope.launch {
            val userId = prefs.currentUser.firstOrNull()?.id ?: ""
            val repResult = repRepo.getUserReputation(userId)
            repResult.getOrNull()?.let { _reputation.value = it }
            val badgeResult = repRepo.getBadges(userId)
            badgeResult.getOrNull()?.let { _badges.value = it }
            val lbResult = repRepo.getLeaderboard()
            lbResult.getOrNull()?.let { _leaderboard.value = it }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            authRepo.logout()
            onDone()
        }
    }
}

@Composable
fun ProfileScreen(
    navController: NavController,
    onLogout: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val user by viewModel.user.collectAsState()
    val reputation by viewModel.reputation.collectAsState()
    val badges by viewModel.badges.collectAsState()
    val leaderboard by viewModel.leaderboard.collectAsState()
    val role by viewModel.role.collectAsState()
    val karmaProfile by viewModel.karmaProfile.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Profile", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                KindKartBadge(
                    text = role.label.uppercase(),
                    variant = when (role) {
                        UserRole.ADMIN -> BadgeVariant.ERROR
                        UserRole.SELLER -> BadgeVariant.INFO
                        UserRole.USER -> BadgeVariant.GHOST
                    }
                )
            }
        }

        // Profile Card
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier.size(72.dp).clip(CircleShape).background(Brush.linearGradient(listOf(KindKartGreen, KindKartGreenLight))),
                        contentAlignment = Alignment.Center,
                    ) { Text((user?.name ?: "U").take(1).uppercase(), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextOnPrimary) }
                    Spacer(Modifier.height(12.dp))
                    Text(user?.name ?: "Neighbor", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text(user?.email?.ifEmpty { "Guest mode" } ?: "Guest mode", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CountUpText(targetValue = reputation.totalPoints, style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                            Text("Points", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("#${reputation.rank ?: "-"}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = KindKartGreen)
                            Text("Rank", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CountUpText(targetValue = badges.size, style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                            Text("Badges", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                    }
                }
            }
        }

        // ===== Karma Dashboard =====
        item { SectionHeader("Karma Dashboard") }
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    AnimatedCircularProgress(
                        progress = karmaProfile.nextBadgeProgress,
                        size = 88.dp,
                        strokeWidth = 5.dp,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CountUpText(
                                targetValue = karmaProfile.totalKarma,
                                style = MaterialTheme.typography.titleLarge,
                                color = KindKartGreen,
                            )
                            Text("Karma", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🎁", fontSize = 18.sp)
                            Text("${karmaProfile.donations}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Donated", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🤝", fontSize = 18.sp)
                            Text("${karmaProfile.helpsGiven}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Helped", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🔄", fontSize = 18.sp)
                            Text("${karmaProfile.exchanges}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Exchanged", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    StreakFlame(streakDays = karmaProfile.streakDays)
                    if (karmaProfile.nextBadgeName.isNotEmpty() && karmaProfile.nextBadgeName != "Max Level!") {
                        Spacer(Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = { karmaProfile.nextBadgeProgress },
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = KindKartGreen,
                            trackColor = SurfaceMuted,
                        )
                        Text(
                            "Next badge: ${karmaProfile.nextBadgeName}",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextTertiary,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                    }
                }
            }
        }

        // Karma Badges
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                items(karmaProfile.badges) { badge ->
                    AnimatedBadgeChip(
                        icon = badge.icon,
                        label = badge.name,
                        isUnlocked = badge.isUnlocked,
                    )
                }
            }
        }

        // Scores
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                PremiumCard(modifier = Modifier.weight(1f)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Helper Score", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        Spacer(Modifier.height(4.dp))
                        CountUpText(targetValue = reputation.helperScore, style = MaterialTheme.typography.headlineSmall, color = KindKartGreen)
                    }
                }
                PremiumCard(modifier = Modifier.weight(1f)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Requester Score", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        Spacer(Modifier.height(4.dp))
                        CountUpText(targetValue = reputation.requesterScore, style = MaterialTheme.typography.headlineSmall, color = InfoBlue)
                    }
                }
            }
        }

        // Reputation Badges
        item { SectionHeader("Badges & Achievements") }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(badges) { badge ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                        border = CardDefaults.outlinedCardBorder().let { androidx.compose.foundation.BorderStroke(1.dp, SurfaceCardBorder) },
                    ) {
                        Column(Modifier.padding(16.dp).width(120.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(badge.icon, fontSize = 28.sp)
                            Spacer(Modifier.height(8.dp))
                            Text(badge.name, style = MaterialTheme.typography.labelLarge, color = TextPrimary, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold)
                            Spacer(Modifier.height(2.dp))
                            Text(badge.description, style = MaterialTheme.typography.labelSmall, color = TextTertiary, textAlign = TextAlign.Center, maxLines = 2)
                        }
                    }
                }
            }
        }

        // Leaderboard
        item { SectionHeader("Leaderboard") }
        items(leaderboard.take(5)) { entry ->
            PremiumCard {
                Row(Modifier.padding(12.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(32.dp).clip(CircleShape).background(
                            when (entry.rank) { 1 -> WarningAmber; 2 -> TextSecondary; 3 -> Color(0xFFCD7F32); else -> SurfaceMuted }
                        ),
                        contentAlignment = Alignment.Center,
                    ) { Text("${entry.rank}", fontWeight = FontWeight.Bold, color = TextOnPrimary, fontSize = 13.sp) }
                    Spacer(Modifier.width(12.dp))
                    Text(entry.name, style = MaterialTheme.typography.titleSmall, color = TextPrimary, modifier = Modifier.weight(1f))
                    Text("${entry.totalPoints} pts", style = MaterialTheme.typography.labelLarge, color = KindKartGreen, fontWeight = FontWeight.Bold)
                }
            }
        }

        // ===== RBAC: Conditional Sections =====
        if (role == UserRole.SELLER || role == UserRole.ADMIN) {
            item { SectionHeader("Seller Tools") }
            item {
                PremiumCard(interactive = true, onClick = {}) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Storefront, null, tint = InfoBlue, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text("My Products", style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text("Manage your listings", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                    }
                }
            }
        }

        if (role == UserRole.ADMIN) {
            item { SectionHeader("Admin") }
            item {
                AnimatedScaleButton(
                    onClick = { navController.navigate(Routes.ADMIN) },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    containerColor = ErrorRed.copy(alpha = 0.9f),
                ) {
                    Icon(Icons.Outlined.AdminPanelSettings, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Admin Panel", fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Logout
        item {
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = { viewModel.logout(onLogout) },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.horizontalGradient(listOf(ErrorRed, ErrorRed))),
            ) {
                Icon(Icons.Outlined.Logout, null, Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Sign Out", fontWeight = FontWeight.SemiBold)
            }
        }

        // Credits
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceMuted),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("KindKart v1.0.0", style = MaterialTheme.typography.labelLarge, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(4.dp))
                    Text("Developed by Garv Anand", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                    Text("B.Tech CSE — VIT", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
