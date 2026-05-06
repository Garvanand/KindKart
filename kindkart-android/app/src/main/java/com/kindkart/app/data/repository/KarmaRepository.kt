package com.kindkart.app.data.repository

import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class KarmaRepository @Inject constructor(
    private val prefs: UserPreferences,
) {
    // In-memory store (demo mode) — would be API-backed in production
    private val _listings = MutableStateFlow(demoListings())
    val listings: StateFlow<List<KarmaListing>> = _listings.asStateFlow()

    private val _activities = MutableStateFlow(demoActivities())
    val activities: StateFlow<List<KarmaActivity>> = _activities.asStateFlow()

    private val _profile = MutableStateFlow(demoKarmaProfile())
    val profile: StateFlow<KarmaProfile> = _profile.asStateFlow()

    fun createListing(title: String, description: String, category: KarmaCategory) {
        val newListing = KarmaListing(
            id = "kl_${System.currentTimeMillis()}",
            title = title,
            description = description,
            category = category,
            creatorId = "self",
            creatorName = "You",
            createdAt = java.time.Instant.now().toString(),
            karmaPointsReward = when (category) {
                KarmaCategory.DONATION -> 25
                KarmaCategory.HELP -> 20
                KarmaCategory.EXCHANGE -> 15
            },
        )
        _listings.value = listOf(newListing) + _listings.value

        // Award karma points and add activity
        val points = newListing.karmaPointsReward
        val action = when (category) {
            KarmaCategory.DONATION -> "donated"
            KarmaCategory.HELP -> "offered help"
            KarmaCategory.EXCHANGE -> "exchanged"
        }
        val messages = listOf(
            "You made someone's day ❤️",
            "Kindness creates ripples 🌊",
            "The world needs more people like you 🌟",
            "Small acts, big impact 🌱",
            "You're a community superstar! ⭐",
        )
        val activity = KarmaActivity(
            id = "ka_${System.currentTimeMillis()}",
            userId = "self",
            userName = "You",
            action = action,
            listingTitle = title,
            pointsEarned = points,
            message = messages.random(),
            createdAt = java.time.Instant.now().toString(),
        )
        _activities.value = listOf(activity) + _activities.value

        // Update profile
        val current = _profile.value
        val newTotal = current.totalKarma + points
        val newLevel = 1 + newTotal / 100
        _profile.value = current.copy(
            totalKarma = newTotal,
            level = newLevel,
            donations = current.donations + if (category == KarmaCategory.DONATION) 1 else 0,
            exchanges = current.exchanges + if (category == KarmaCategory.EXCHANGE) 1 else 0,
            helpsGiven = current.helpsGiven + if (category == KarmaCategory.HELP) 1 else 0,
            badges = evaluateBadges(newTotal, current.donations + 1, current.helpsGiven + 1),
            nextBadgeProgress = calculateNextBadgeProgress(newTotal),
            nextBadgeName = getNextBadgeName(newTotal),
            streakDays = current.streakDays + if (current.streakDays == 0) 1 else 0,
        )
    }

    // ===== Badge Evaluation =====
    private fun evaluateBadges(totalKarma: Int, donations: Int, helps: Int): List<KarmaBadge> {
        return listOf(
            KarmaBadge("kb1", "First Step", "Post your first karma listing", "🌱", 0, true),
            KarmaBadge("kb2", "Helper", "Help 3 people", "🤝", 50, helps >= 3),
            KarmaBadge("kb3", "Donor", "Donate 5 items", "🎁", 100, donations >= 5),
            KarmaBadge("kb4", "Community Star", "Earn 200 karma", "⭐", 200, totalKarma >= 200),
            KarmaBadge("kb5", "Karma Legend", "Earn 500 karma", "🏆", 500, totalKarma >= 500),
            KarmaBadge("kb6", "Neighborhood Hero", "Earn 1000 karma", "🦸", 1000, totalKarma >= 1000),
        )
    }

    private fun calculateNextBadgeProgress(totalKarma: Int): Float {
        val thresholds = listOf(0, 50, 100, 200, 500, 1000)
        val currentThreshold = thresholds.lastOrNull { it <= totalKarma } ?: 0
        val nextThreshold = thresholds.firstOrNull { it > totalKarma } ?: thresholds.last()
        if (nextThreshold == currentThreshold) return 1f
        return (totalKarma - currentThreshold).toFloat() / (nextThreshold - currentThreshold)
    }

    private fun getNextBadgeName(totalKarma: Int): String {
        return when {
            totalKarma < 50 -> "Helper"
            totalKarma < 100 -> "Donor"
            totalKarma < 200 -> "Community Star"
            totalKarma < 500 -> "Karma Legend"
            totalKarma < 1000 -> "Neighborhood Hero"
            else -> "Max Level!"
        }
    }

    // ===== Demo Data =====
    private fun demoListings(): List<KarmaListing> = listOf(
        KarmaListing("kl1", "Old textbooks to donate", "Engineering textbooks from 2nd year. Good condition, free to take.", KarmaCategory.DONATION, "u1", "Ananya Sharma", "2026-03-28T10:30:00Z", 25),
        KarmaListing("kl2", "Need a study buddy for DSA", "Looking for someone to do LeetCode sessions together on weekends.", KarmaCategory.HELP, "u3", "Priya Nair", "2026-03-27T14:00:00Z", 20),
        KarmaListing("kl3", "Exchange: Guitar for ukulele", "I have a beginner acoustic guitar, looking to exchange for a ukulele.", KarmaCategory.EXCHANGE, "u4", "Karthik Iyer", "2026-03-26T09:00:00Z", 15),
        KarmaListing("kl4", "Free home-cooked meals for students", "I cook extra on Sundays. Happy to share with anyone who needs a home-cooked meal.", KarmaCategory.DONATION, "u2", "Rahul Menon", "2026-03-25T18:00:00Z", 25),
        KarmaListing("kl5", "Help moving into new apartment", "Moving next Saturday, could use an extra pair of hands. Will provide snacks!", KarmaCategory.HELP, "u5", "Deepa Gupta", "2026-03-24T11:45:00Z", 20),
    )

    private fun demoActivities(): List<KarmaActivity> = listOf(
        KarmaActivity("ka1", "u1", "Ananya Sharma", "donated", "Old textbooks", 25, "You made someone's day ❤️", "2026-03-28T10:30:00Z"),
        KarmaActivity("ka2", "u3", "Priya Nair", "offered help", "Study buddy for DSA", 20, "Kindness creates ripples 🌊", "2026-03-27T14:00:00Z"),
        KarmaActivity("ka3", "u4", "Karthik Iyer", "exchanged", "Guitar for ukulele", 15, "Small acts, big impact 🌱", "2026-03-26T09:00:00Z"),
        KarmaActivity("ka4", "u2", "Rahul Menon", "donated", "Home-cooked meals", 25, "The world needs more people like you 🌟", "2026-03-25T18:00:00Z"),
        KarmaActivity("ka5", "u5", "Deepa Gupta", "offered help", "Moving help", 20, "You're a community superstar! ⭐", "2026-03-24T11:45:00Z"),
    )

    private fun demoKarmaProfile(): KarmaProfile = KarmaProfile(
        totalKarma = 145,
        level = 2,
        streakDays = 5,
        donations = 3,
        exchanges = 1,
        helpsGiven = 2,
        badges = evaluateBadges(145, 3, 2),
        nextBadgeProgress = calculateNextBadgeProgress(145),
        nextBadgeName = getNextBadgeName(145),
    )
}
