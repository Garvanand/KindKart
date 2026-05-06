package com.kindkart.app.data.model

import com.google.gson.annotations.SerializedName

// ===== Karma Category =====
enum class KarmaCategory(val label: String, val icon: String, val colorHex: Long) {
    DONATION("Donation", "🎁", 0xFF22C55E),
    EXCHANGE("Exchange", "🔄", 0xFF0EA5E9),
    HELP("Help", "🤝", 0xFFF59E0B),
}

// ===== Karma Listing =====
data class KarmaListing(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val category: KarmaCategory = KarmaCategory.DONATION,
    val creatorId: String = "",
    val creatorName: String = "",
    val createdAt: String = "",
    val karmaPointsReward: Int = 10,
    val isClaimed: Boolean = false,
    val claimedBy: String? = null,
)

// ===== Karma Activity (Feed Entry) =====
data class KarmaActivity(
    val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val action: String = "",         // "donated", "helped", "exchanged"
    val listingTitle: String = "",
    val pointsEarned: Int = 0,
    val message: String = "",        // appreciation message
    val createdAt: String = "",
)

// ===== Karma Badge =====
data class KarmaBadge(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val icon: String = "",
    val requiredPoints: Int = 0,
    val isUnlocked: Boolean = false,
)

// ===== Karma Profile =====
data class KarmaProfile(
    val totalKarma: Int = 0,
    val level: Int = 1,
    val streakDays: Int = 0,
    val donations: Int = 0,
    val exchanges: Int = 0,
    val helpsGiven: Int = 0,
    val badges: List<KarmaBadge> = emptyList(),
    val nextBadgeProgress: Float = 0f,   // 0..1
    val nextBadgeName: String = "",
)
