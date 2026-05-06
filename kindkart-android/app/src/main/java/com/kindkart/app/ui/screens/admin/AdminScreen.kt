package com.kindkart.app.ui.screens.admin

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.kindkart.app.data.rbac.UserRole
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.theme.*

@Composable
fun AdminScreen(
    navController: NavController,
    userRole: UserRole,
) {
    // Guard: only admin can access
    if (userRole != UserRole.ADMIN) {
        Column(
            modifier = Modifier.fillMaxSize().background(SurfaceBackground).padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            EmptyState(
                icon = Icons.Outlined.Lock,
                title = "Access Restricted",
                description = "You don't have permission to access the admin panel.",
                actionLabel = "Go Back",
                onAction = { navController.popBackStack() },
            )
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Header
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Outlined.ArrowBack, "Back")
                }
                Column {
                    Text("Admin Panel", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text("Manage your community", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                }
            }
        }

        // Stats Overview
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp)) {
                    Text("Overview", style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(16.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                    ) {
                        AdminStatItem(icon = Icons.Outlined.People, value = "42", label = "Users", color = InfoBlue)
                        AdminStatItem(icon = Icons.Outlined.ShoppingBag, value = "18", label = "Listings", color = KindKartGreen)
                        AdminStatItem(icon = Icons.Outlined.VolunteerActivism, value = "27", label = "Karma Posts", color = WarningAmber)
                        AdminStatItem(icon = Icons.Outlined.Flag, value = "3", label = "Reports", color = ErrorRed)
                    }
                }
            }
        }

        // Quick Actions
        item { SectionHeader("Quick Actions") }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                AdminActionCard(
                    icon = Icons.Outlined.PersonAdd,
                    title = "Manage Users",
                    subtitle = "Review & moderate",
                    color = InfoBlue,
                    modifier = Modifier.weight(1f),
                )
                AdminActionCard(
                    icon = Icons.Outlined.Storefront,
                    title = "Moderate Listings",
                    subtitle = "Approve & remove",
                    color = KindKartGreen,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                AdminActionCard(
                    icon = Icons.Outlined.VolunteerActivism,
                    title = "Karma Posts",
                    subtitle = "Review karma feed",
                    color = WarningAmber,
                    modifier = Modifier.weight(1f),
                )
                AdminActionCard(
                    icon = Icons.Outlined.Shield,
                    title = "Safety Center",
                    subtitle = "Emergency alerts",
                    color = ErrorRed,
                    modifier = Modifier.weight(1f),
                )
            }
        }

        // Recent Reports (demo)
        item { SectionHeader("Recent Reports") }
        val reports = listOf(
            Triple("Spam listing reported", "\"Free iPhone\" — looks like a scam", "2 hours ago"),
            Triple("Inappropriate content", "A user posted offensive language", "5 hours ago"),
            Triple("Duplicate account", "Two accounts with similar details", "1 day ago"),
        )
        items(reports) { (title, desc, time) ->
            SlideInItem(index = reports.indexOf(Triple(title, desc, time))) {
                PremiumCard {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
                        Icon(
                            Icons.Outlined.Report,
                            null,
                            tint = ErrorRed,
                            modifier = Modifier.size(20.dp),
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text(desc, style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                            Text(time, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        KindKartBadge(text = "OPEN", variant = BadgeVariant.ERROR)
                    }
                }
            }
        }

        // User Management (demo list)
        item { SectionHeader("Recent Users") }
        val users = listOf(
            Triple("Ananya Sharma", "USER", "Active"),
            Triple("Rahul Menon", "SELLER", "Active"),
            Triple("Priya Nair", "USER", "Active"),
            Triple("Karthik Iyer", "ADMIN", "Active"),
        )
        items(users) { (name, role, status) ->
            PremiumCard {
                Row(Modifier.padding(12.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    UserAvatar(name = name, size = 38.dp)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(name, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                        Text(status, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                    }
                    KindKartBadge(
                        text = role,
                        variant = when (role) {
                            "ADMIN" -> BadgeVariant.ERROR
                            "SELLER" -> BadgeVariant.INFO
                            else -> BadgeVariant.GHOST
                        }
                    )
                }
            }
        }

        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun AdminStatItem(
    icon: ImageVector,
    value: String,
    label: String,
    color: androidx.compose.ui.graphics.Color,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, null, tint = color, modifier = Modifier.size(24.dp))
        Spacer(Modifier.height(6.dp))
        CountUpText(
            targetValue = value.toIntOrNull() ?: 0,
            style = MaterialTheme.typography.titleLarge,
            color = TextPrimary,
        )
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
    }
}

@Composable
private fun AdminActionCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
) {
    PremiumCard(modifier = modifier) {
        Column(Modifier.padding(16.dp)) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.height(10.dp))
            Text(title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
        }
    }
}
