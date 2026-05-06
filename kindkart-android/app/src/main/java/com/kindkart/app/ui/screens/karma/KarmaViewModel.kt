package com.kindkart.app.ui.screens.karma

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kindkart.app.data.model.*
import com.kindkart.app.data.repository.KarmaRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class KarmaUiState(
    val listings: List<KarmaListing> = emptyList(),
    val activities: List<KarmaActivity> = emptyList(),
    val profile: KarmaProfile = KarmaProfile(),
    val isLoading: Boolean = true,
    val showCreateSheet: Boolean = false,
    val showSuccessMessage: Boolean = false,
    val successMessage: String = "",
    val selectedTab: Int = 0,  // 0 = Feed, 1 = Listings, 2 = My Badges
)

@HiltViewModel
class KarmaViewModel @Inject constructor(
    private val karmaRepo: KarmaRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(KarmaUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            karmaRepo.profile.collect { profile ->
                _uiState.update { it.copy(profile = profile) }
            }
        }
        viewModelScope.launch {
            karmaRepo.listings.collect { listings ->
                _uiState.update { it.copy(listings = listings, isLoading = false) }
            }
        }
        viewModelScope.launch {
            karmaRepo.activities.collect { activities ->
                _uiState.update { it.copy(activities = activities) }
            }
        }
    }

    fun setTab(index: Int) {
        _uiState.update { it.copy(selectedTab = index) }
    }

    fun toggleCreateSheet() {
        _uiState.update { it.copy(showCreateSheet = !it.showCreateSheet) }
    }

    fun createListing(title: String, description: String, category: KarmaCategory) {
        karmaRepo.createListing(title, description, category)
        val msg = when (category) {
            KarmaCategory.DONATION -> "You made someone's day ❤️"
            KarmaCategory.HELP -> "The world needs more people like you 🌟"
            KarmaCategory.EXCHANGE -> "Sharing is caring 🤝"
        }
        _uiState.update { it.copy(showCreateSheet = false, showSuccessMessage = true, successMessage = msg) }
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000)
            _uiState.update { it.copy(showSuccessMessage = false) }
        }
    }

    fun dismissSuccess() {
        _uiState.update { it.copy(showSuccessMessage = false) }
    }
}
