package com.kindkart.app.ui.screens.requests

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.kindkart.app.data.model.HelpRequest
import com.kindkart.app.data.model.HelpRequestCreate
import com.kindkart.app.data.repository.CommunityRepository
import com.kindkart.app.data.repository.RequestRepository
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.navigation.Routes
import com.kindkart.app.ui.theme.*
import com.kindkart.app.util.DemoData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ===== ViewModel =====
data class RequestsUiState(
    val requests: List<HelpRequest> = emptyList(),
    val isLoading: Boolean = true,
    val selectedFilter: Int = 0,
)

@HiltViewModel
class RequestsViewModel @Inject constructor(
    private val requestRepo: RequestRepository,
    private val communityRepo: CommunityRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(RequestsUiState())
    val uiState = _uiState.asStateFlow()

    init { loadRequests() }

    fun loadRequests() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val commResult = communityRepo.getUserCommunities()
            val ids = commResult.getOrDefault(emptyList()).map { it.community.id }
            val reqResult = requestRepo.getAllRequests(ids)
            _uiState.update { it.copy(requests = reqResult.getOrDefault(emptyList()), isLoading = false) }
        }
    }

    fun setFilter(index: Int) { _uiState.update { it.copy(selectedFilter = index) } }

    fun filteredRequests(): List<HelpRequest> {
        val all = _uiState.value.requests
        return when (_uiState.value.selectedFilter) {
            1 -> all.sortedByDescending { it.createdAt }
            2 -> all.filter { it.status.lowercase() == "pending" }
            3 -> all.filter { it.status.lowercase() == "completed" }
            else -> all
        }
    }
}

// ===== Requests Screen =====
@Composable
fun RequestsScreen(
    navController: NavController,
    viewModel: RequestsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    val filtered = viewModel.filteredRequests()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Header
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Help Requests", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                FilledIconButton(
                    onClick = { navController.navigate(Routes.CREATE_REQUEST) },
                    shape = RoundedCornerShape(14.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = KindKartGreen),
                ) { Icon(Icons.Default.Add, null, tint = TextOnPrimary) }
            }
        }

        // Filters
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val filters = listOf("For you", "Recent", "Needs help", "Resolved")
                items(filters.size) { idx ->
                    FilterChip(
                        selected = state.selectedFilter == idx,
                        onClick = { viewModel.setFilter(idx) },
                        label = { Text(filters[idx], fontSize = 13.sp, fontWeight = FontWeight.SemiBold) },
                        shape = RoundedCornerShape(20.dp),
                        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = SurfaceCard, selectedLabelColor = TextPrimary),
                        border = FilterChipDefaults.filterChipBorder(enabled = true, selected = state.selectedFilter == idx, borderColor = SurfaceCardBorder, selectedBorderColor = TextPrimary),
                    )
                }
            }
        }

        if (state.isLoading) {
            items(4) { ShimmerCard() }
        } else if (filtered.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Outlined.HelpOutline,
                    title = "No requests found",
                    description = "Try a different filter or create a new request.",
                    actionLabel = "Post Request",
                    onAction = { navController.navigate(Routes.CREATE_REQUEST) },
                )
            }
        } else {
            items(filtered, key = { it.id }) { request ->
                PremiumCard(interactive = true, onClick = { navController.navigate(Routes.requestDetail(request.id)) }) {
                    Column(Modifier.padding(16.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(request.title, style = MaterialTheme.typography.titleMedium, color = TextPrimary, modifier = Modifier.weight(1f))
                            Spacer(Modifier.width(8.dp))
                            KindKartBadge(request.status.uppercase(), variant = when (request.status.lowercase()) { "completed" -> BadgeVariant.SUCCESS; "accepted" -> BadgeVariant.INFO; else -> BadgeVariant.WARNING })
                        }
                        Spacer(Modifier.height(6.dp))
                        Text(request.description, style = MaterialTheme.typography.bodySmall, color = TextTertiary, maxLines = 2)
                        Spacer(Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (request.category.isNotEmpty()) Text(request.category, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                            request.requester?.name?.let { Text("• $it", style = MaterialTheme.typography.labelSmall, color = TextTertiary) }
                        }
                    }
                }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }
}

// ===== Request Detail Screen =====
@Composable
fun RequestDetailScreen(requestId: String, navController: NavController) {
    val request = DemoData.helpRequests.find { it.id == requestId }
    if (request == null) {
        EmptyState(icon = Icons.Outlined.ErrorOutline, title = "Request not found", description = "This request may have been removed.")
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Outlined.ArrowBack, "Back") }
                Text("Request Details", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
            }
        }
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(request.title, style = MaterialTheme.typography.headlineSmall, color = TextPrimary, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        KindKartBadge(request.status.uppercase(), variant = when (request.status.lowercase()) { "completed" -> BadgeVariant.SUCCESS; else -> BadgeVariant.WARNING })
                    }
                    Spacer(Modifier.height(16.dp))
                    Text(request.description, style = MaterialTheme.typography.bodyLarge, color = TextSecondary)
                    Spacer(Modifier.height(16.dp))
                    HorizontalDivider(color = SurfaceCardBorder)
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Column { Text("Category", style = MaterialTheme.typography.labelSmall, color = TextTertiary); Text(request.category, style = MaterialTheme.typography.bodyMedium, color = TextPrimary, fontWeight = FontWeight.Medium) }
                        Column { Text("Posted by", style = MaterialTheme.typography.labelSmall, color = TextTertiary); Text(request.requester?.name ?: "Anonymous", style = MaterialTheme.typography.bodyMedium, color = TextPrimary, fontWeight = FontWeight.Medium) }
                    }
                }
            }
        }
        item {
            Button(
                onClick = { navController.navigate(Routes.chatThread(request.id)) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
            ) {
                Icon(Icons.Outlined.ChatBubbleOutline, null, Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Respond to Request", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
        }
    }
}

// ===== Create Request Screen =====
@Composable
fun CreateRequestScreen(navController: NavController) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableIntStateOf(0) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) { Icon(Icons.Outlined.ArrowBack, "Back") }
                Text("Post a Request", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = TextPrimary)
            }
        }
        item {
            PremiumCard {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    OutlinedTextField(
                        value = title, onValueChange = { title = it },
                        label = { Text("Title") }, placeholder = { Text("What do you need help with?") },
                        singleLine = true, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
                    )
                    OutlinedTextField(
                        value = description, onValueChange = { description = it },
                        label = { Text("Description") }, placeholder = { Text("Provide more details...") },
                        minLines = 3, maxLines = 6, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
                    )
                    Text("Category", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(DemoData.helpCategories.size) { idx ->
                            val cat = DemoData.helpCategories[idx]
                            FilterChip(
                                selected = selectedCategory == idx,
                                onClick = { selectedCategory = idx },
                                label = { Text("${cat.icon} ${cat.name}", fontSize = 13.sp) },
                                shape = RoundedCornerShape(20.dp),
                            )
                        }
                    }
                    Button(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(24.dp),
                        enabled = title.isNotBlank() && description.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
                    ) {
                        Text("Post Request", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}
