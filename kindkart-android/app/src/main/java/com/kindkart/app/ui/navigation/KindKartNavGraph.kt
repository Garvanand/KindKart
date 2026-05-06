package com.kindkart.app.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.kindkart.app.data.rbac.RbacManager
import com.kindkart.app.data.rbac.UserRole
import com.kindkart.app.ui.components.KindKartBottomBar
import com.kindkart.app.ui.screens.admin.AdminScreen
import com.kindkart.app.ui.screens.auth.AuthScreen
import com.kindkart.app.ui.screens.chat.ChatListScreen
import com.kindkart.app.ui.screens.chat.ChatScreen
import com.kindkart.app.ui.screens.communities.CommunitiesScreen
import com.kindkart.app.ui.screens.communities.CommunityDetailScreen
import com.kindkart.app.ui.screens.home.HomeScreen
import com.kindkart.app.ui.screens.karma.KarmaScreen
import com.kindkart.app.ui.screens.profile.ProfileScreen
import com.kindkart.app.ui.screens.requests.CreateRequestScreen
import com.kindkart.app.ui.screens.requests.RequestDetailScreen
import com.kindkart.app.ui.screens.requests.RequestsScreen
import com.kindkart.app.ui.screens.splash.SplashScreen
import com.kindkart.app.ui.screens.wallet.WalletScreen

object Routes {
    const val SPLASH = "splash"
    const val AUTH = "auth"
    const val HOME = "home"
    const val REQUESTS = "requests"
    const val CHAT = "chat"
    const val KARMA = "karma"
    const val WALLET = "wallet"
    const val PROFILE = "profile"
    const val ADMIN = "admin"
    const val REQUEST_DETAIL = "request_detail/{requestId}"
    const val CREATE_REQUEST = "create_request"
    const val COMMUNITIES = "communities"
    const val COMMUNITY_DETAIL = "community_detail/{communityId}"
    const val CHAT_THREAD = "chat_thread/{requestId}"

    fun requestDetail(id: String) = "request_detail/$id"
    fun communityDetail(id: String) = "community_detail/$id"
    fun chatThread(requestId: String) = "chat_thread/$requestId"
}

private val mainTabs = setOf(Routes.HOME, Routes.REQUESTS, Routes.CHAT, Routes.KARMA, Routes.WALLET, Routes.PROFILE)

// Smooth enter/exit for main tabs (crossfade)
private val tabEnter = fadeIn(animationSpec = tween(250))
private val tabExit = fadeOut(animationSpec = tween(250))

// Slide for detail screens
private val detailEnter = fadeIn(tween(250)) + slideInHorizontally(tween(300)) { it / 3 }
private val detailExit = fadeOut(tween(200))
private val detailPopEnter = fadeIn(tween(250)) + slideInHorizontally(tween(300)) { -it / 3 }
private val detailPopExit = fadeOut(tween(200)) + slideOutHorizontally(tween(300)) { it / 3 }

@Composable
fun KindKartApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in mainTabs || currentRoute == Routes.COMMUNITIES

    Scaffold(
        bottomBar = {
            KindKartBottomBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(Routes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                visible = showBottomBar,
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.SPLASH,
            modifier = Modifier.padding(innerPadding),
            enterTransition = { detailEnter },
            exitTransition = { detailExit },
            popEnterTransition = { detailPopEnter },
            popExitTransition = { detailPopExit },
        ) {
            composable(
                Routes.SPLASH,
                enterTransition = { fadeIn(tween(300)) },
                exitTransition = { fadeOut(tween(300)) },
            ) {
                SplashScreen(
                    onNavigateToAuth = {
                        navController.navigate(Routes.AUTH) {
                            popUpTo(Routes.SPLASH) { inclusive = true }
                        }
                    },
                    onNavigateToHome = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.SPLASH) { inclusive = true }
                        }
                    },
                )
            }

            composable(
                Routes.AUTH,
                enterTransition = { fadeIn(tween(300)) },
                exitTransition = { fadeOut(tween(300)) },
            ) {
                AuthScreen(
                    onAuthSuccess = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.AUTH) { inclusive = true }
                        }
                    }
                )
            }

            // ===== Main Tabs (crossfade) =====
            composable(
                Routes.HOME,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                HomeScreen(navController = navController)
            }

            composable(
                Routes.REQUESTS,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                RequestsScreen(navController = navController)
            }

            composable(
                Routes.CHAT,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                ChatListScreen(navController = navController)
            }

            composable(
                Routes.KARMA,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                KarmaScreen(navController = navController)
            }

            composable(
                Routes.WALLET,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                WalletScreen(navController = navController)
            }

            composable(
                Routes.PROFILE,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                ProfileScreen(
                    navController = navController,
                    onLogout = {
                        navController.navigate(Routes.AUTH) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            // ===== Admin =====
            composable(Routes.ADMIN) {
                AdminScreen(
                    navController = navController,
                    userRole = UserRole.ADMIN, // In production, inject from RbacManager
                )
            }

            // ===== Detail Screens (use default slide transitions) =====
            composable(
                Routes.REQUEST_DETAIL,
                arguments = listOf(navArgument("requestId") { type = NavType.StringType })
            ) { backStackEntry ->
                val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
                RequestDetailScreen(requestId = requestId, navController = navController)
            }

            composable(Routes.CREATE_REQUEST) {
                CreateRequestScreen(navController = navController)
            }

            composable(
                Routes.COMMUNITIES,
                enterTransition = { tabEnter },
                exitTransition = { tabExit },
            ) {
                CommunitiesScreen(navController = navController)
            }

            composable(
                Routes.COMMUNITY_DETAIL,
                arguments = listOf(navArgument("communityId") { type = NavType.StringType })
            ) { backStackEntry ->
                val communityId = backStackEntry.arguments?.getString("communityId") ?: ""
                CommunityDetailScreen(communityId = communityId, navController = navController)
            }

            composable(
                Routes.CHAT_THREAD,
                arguments = listOf(navArgument("requestId") { type = NavType.StringType })
            ) { backStackEntry ->
                val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
                ChatScreen(requestId = requestId, navController = navController)
            }
        }
    }
}
