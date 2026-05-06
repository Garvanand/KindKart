package com.kindkart.app.ui.screens.communities

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.kindkart.app.data.model.CommunityMembership
import com.kindkart.app.data.repository.CommunityRepository
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.navigation.Routes
import com.kindkart.app.ui.theme.*
import com.kindkart.app.util.DemoData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CommunitiesViewModel @Inject constructor(
    private val communityRepo: CommunityRepository,
) : ViewModel() {
    private val _communities = MutableStateFlow<List<CommunityMembership>>(emptyList())
    val communities = _communities.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init { loadCommunities() }

    fun loadCommunities() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = communityRepo.getUserCommunities()
            _communities.value = result.getOrDefault(emptyList())
            _isLoading.value = false
        }
    }
}

@Composable
fun CommunitiesScreen(navController: NavController, viewModel: CommunitiesViewModel = hiltViewModel()) {
    val communities by viewModel.communities.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("Communities", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text("Your neighborhood groups", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                }
                IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Outlined.Close, "Close", tint = TextSecondary) }
            }
        }

        if (isLoading) {
            items(3) { ShimmerCard() }
        } else if (communities.isEmpty()) {
            item { EmptyState(icon = Icons.Outlined.People, title = "No communities", description = "Create or join a community to get started.") }
        } else {
            items(communities, key = { it.id }) { membership ->
                PremiumCard(interactive = true, onClick = { navController.navigate(Routes.communityDetail(membership.community.id)) }) {
                    Row(Modifier.padding(16.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        UserAvatar(name = membership.community.name, size = 48.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(membership.community.name, style = MaterialTheme.typography.titleSmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                            Spacer(Modifier.height(2.dp))
                            Text("Code: ${membership.community.inviteCode}", style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        KindKartBadge(membership.role.replaceFirstChar { it.uppercase() }, variant = if (membership.role == "admin") BadgeVariant.SUCCESS else BadgeVariant.GHOST)
                    }
                }
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {},
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
                ) {
                    Icon(Icons.Default.Add, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Create Group", fontWeight = FontWeight.SemiBold)
                }
                OutlinedButton(
                    onClick = {},
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                ) {
                    Icon(Icons.Outlined.PersonAdd, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Join Group")
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
fun CommunityDetailScreen(communityId: String, navController: NavController) {
    val community = DemoData.communities.find { it.community.id == communityId }?.community

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Outlined.ArrowBack, "Back") }
                Text(community?.name ?: "Community", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
            }
        }
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text(community?.name ?: "", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(Modifier.height(4.dp))
                            Text("Invite code: ${community?.inviteCode ?: ""}", style = MaterialTheme.typography.bodySmall, color = TextTertiary)
                        }
                        UserAvatar(name = community?.name ?: "C", size = 56.dp)
                    }
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        StatCard(label = "Members", value = "24")
                        StatCard(label = "Active Requests", value = "7")
                        StatCard(label = "Events", value = "3")
                    }
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { navController.navigate(Routes.CREATE_REQUEST) },
                    modifier = Modifier.weight(1f).height(44.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
                ) {
                    Icon(Icons.Outlined.HelpOutline, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Post Request", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
                OutlinedButton(
                    onClick = {},
                    modifier = Modifier.weight(1f).height(44.dp),
                    shape = RoundedCornerShape(24.dp),
                ) {
                    Icon(Icons.Outlined.Event, null, Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Events", fontSize = 13.sp)
                }
            }
        }

        item { SectionHeader("Recent Activity") }
        items(DemoData.helpRequests.filter { it.communityId == communityId }.take(3)) { request ->
            PremiumCard(interactive = true, onClick = { navController.navigate(Routes.requestDetail(request.id)) }) {
                Column(Modifier.padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(request.title, style = MaterialTheme.typography.titleSmall, color = TextPrimary, modifier = Modifier.weight(1f))
                        KindKartBadge(request.status.uppercase(), variant = if (request.status == "completed") BadgeVariant.SUCCESS else BadgeVariant.WARNING)
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(request.description, style = MaterialTheme.typography.bodySmall, color = TextTertiary, maxLines = 2)
                }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }
}
