package com.kindkart.app.ui.screens.wallet

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.Transaction
import com.kindkart.app.data.model.WalletInfo
import com.kindkart.app.data.repository.WalletRepository
import com.kindkart.app.ui.components.*
import com.kindkart.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val walletRepo: WalletRepository,
    private val prefs: UserPreferences,
) : ViewModel() {
    private val _wallet = MutableStateFlow(WalletInfo())
    val wallet = _wallet.asStateFlow()
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions = _transactions.asStateFlow()
    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    init { loadWallet() }

    fun loadWallet() {
        viewModelScope.launch {
            _isLoading.value = true
            val userId = prefs.currentUser.firstOrNull()?.id ?: ""
            val wResult = walletRepo.getWallet(userId)
            _wallet.value = wResult.getOrDefault(WalletInfo())
            val tResult = walletRepo.getTransactions()
            _transactions.value = tResult.getOrDefault(emptyList())
            _isLoading.value = false
        }
    }
}

@Composable
fun WalletScreen(navController: NavController, viewModel: WalletViewModel = hiltViewModel()) {
    val wallet by viewModel.wallet.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(SurfaceBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Wallet", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
        }

        // Balance Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Brush.linearGradient(listOf(KindKartGreen, KindKartGreenDark)))
                        .padding(24.dp)
                ) {
                    Column {
                        Text("Available Balance", color = TextOnPrimary.copy(alpha = 0.8f), style = MaterialTheme.typography.bodySmall)
                        Spacer(Modifier.height(4.dp))
                        Text("₹${String.format("%.0f", wallet.balance)}", color = TextOnPrimary, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(16.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                            Column {
                                Text("Earned", color = TextOnPrimary.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
                                Text("₹${String.format("%.0f", wallet.totalEarned)}", color = TextOnPrimary, fontWeight = FontWeight.SemiBold)
                            }
                            Column {
                                Text("Spent", color = TextOnPrimary.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
                                Text("₹${String.format("%.0f", wallet.totalSpent)}", color = TextOnPrimary, fontWeight = FontWeight.SemiBold)
                            }
                            Column {
                                Text("Pending", color = TextOnPrimary.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
                                Text("₹${String.format("%.0f", wallet.pendingAmount)}", color = TextOnPrimary, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }

        item { SectionHeader("Recent Transactions") }

        if (isLoading) {
            items(3) { ShimmerCard() }
        } else if (transactions.isEmpty()) {
            item { EmptyState(icon = Icons.Outlined.Receipt, title = "No transactions", description = "Your payment history will appear here.") }
        } else {
            items(transactions, key = { it.id }) { tx ->
                PremiumCard {
                    Row(Modifier.padding(16.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(40.dp).background(
                                if (tx.status == "completed") BadgeSuccessBg else BadgeWarningBg,
                                shape = RoundedCornerShape(12.dp)
                            ),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                if (tx.status == "completed") Icons.Outlined.CheckCircle else Icons.Outlined.Schedule,
                                null,
                                tint = if (tx.status == "completed") SuccessGreen else WarningAmber,
                                modifier = Modifier.size(20.dp),
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Transaction #${tx.id.takeLast(4)}", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                            Text(tx.status.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelSmall, color = TextTertiary)
                        }
                        Text("₹${String.format("%.0f", tx.amount)}", style = MaterialTheme.typography.titleMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }
}
