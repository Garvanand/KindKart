package com.kindkart.app.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.data.repository.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val user: User? = null,
    val isGuest: Boolean = false,
    val isDemoMode: Boolean = false,
    val communities: List<CommunityMembership> = emptyList(),
    val requests: List<HelpRequest> = emptyList(),
    val conversationCount: Int = 0,
    val reputationScore: Int? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val dailyNudge: String = "",
    val karmaScore: Int = 0,
    val streakDays: Int = 0,
)

private val dailyNudges = listOf(
    "Small acts create big impact 🌱",
    "You're doing great today! 🌟",
    "Kindness is contagious — spread it ❤️",
    "Every helping hand makes a difference 🤝",
    "Be the change your neighborhood needs 🏘️",
    "Today is a great day to help someone 😊",
    "Your karma is growing — keep it up! ⭐",
    "One good deed inspires another 🔄",
    "The best communities are built on trust 🛡️",
    "You make this neighborhood better 🌿",
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val communityRepo: CommunityRepository,
    private val requestRepo: RequestRepository,
    private val chatRepo: ChatRepository,
    private val reputationRepo: ReputationRepository,
    private val prefs: UserPreferences,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState = _uiState.asStateFlow()

    init {
        _uiState.update { it.copy(dailyNudge = dailyNudges.random()) }
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val user = prefs.currentUser.firstOrNull()
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            val isDemoMode = prefs.isDemoMode.firstOrNull() ?: false
            val karmaScore = prefs.karmaScore.firstOrNull() ?: 0
            val streakDays = prefs.streakDays.firstOrNull() ?: 0

            _uiState.update {
                it.copy(
                    user = user,
                    isGuest = isGuest,
                    isDemoMode = isDemoMode,
                    karmaScore = karmaScore,
                    streakDays = streakDays,
                )
            }

            // Load communities
            val commResult = communityRepo.getUserCommunities()
            val communities = commResult.getOrDefault(emptyList())

            // Load requests across communities
            val communityIds = communities.map { it.community.id }
            val reqResult = requestRepo.getAllRequests(communityIds)
            val requests = reqResult.getOrDefault(emptyList()).take(10)

            // Load conversations count
            val convResult = chatRepo.getConversations()
            val convCount = convResult.getOrDefault(emptyList()).size

            // Load reputation
            val repResult = user?.let { reputationRepo.getUserReputation(it.id) }
            val repScore = repResult?.getOrNull()?.totalPoints

            _uiState.update {
                it.copy(
                    communities = communities,
                    requests = requests,
                    conversationCount = convCount,
                    reputationScore = repScore,
                    isLoading = false,
                )
            }
        }
    }

    val openRequestCount: Int get() = _uiState.value.requests.count { it.status.lowercase() == "pending" }
    val resolvedRequestCount: Int get() = _uiState.value.requests.count { it.status.lowercase() == "completed" }
}
