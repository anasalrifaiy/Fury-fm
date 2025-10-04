import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import auth from '@react-native-firebase/auth';

const FinancialScreen = () => {
  const [finances, setFinances] = useState({
    balance: 50000000,
    weeklyRevenue: 2500000,
    weeklyExpenses: 1800000,
    transferBudget: 25000000,
    wageBudget: 15000000,
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 15000000, description: 'TV Rights', date: '2024-10-01' },
    { id: 2, type: 'expense', amount: 8000000, description: 'Player Wages', date: '2024-10-01' },
    { id: 3, type: 'income', amount: 5000000, description: 'Sponsorship Deal', date: '2024-09-28' },
    { id: 4, type: 'expense', amount: 12000000, description: 'Player Transfer', date: '2024-09-25' },
    { id: 5, type: 'income', amount: 3000000, description: 'Match Day Revenue', date: '2024-09-24' },
  ]);

  const [sponsorshipModal, setSponsorshipModal] = useState(false);

  const revenue_streams = [
    { name: 'TV Rights', amount: 15000000, type: 'monthly' },
    { name: 'Sponsorship', amount: 5000000, type: 'monthly' },
    { name: 'Match Day', amount: 800000, type: 'per_match' },
    { name: 'Merchandise', amount: 1200000, type: 'monthly' },
    { name: 'Player Sales', amount: 0, type: 'variable' },
  ];

  const expenses = [
    { name: 'Player Wages', amount: 8000000, type: 'monthly' },
    { name: 'Staff Salaries', amount: 1500000, type: 'monthly' },
    { name: 'Stadium Maintenance', amount: 800000, type: 'monthly' },
    { name: 'Training Facilities', amount: 500000, type: 'monthly' },
    { name: 'Youth Academy', amount: 300000, type: 'monthly' },
  ];

  const formatCurrency = (amount) => {
    return `€${(amount / 1000000).toFixed(1)}M`;
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getNetIncome = () => {
    return finances.weeklyRevenue - finances.weeklyExpenses;
  };

  const handleSponsorshipDeal = () => {
    setSponsorshipModal(true);
  };

  const TransactionItem = ({ transaction }) => (
    <View style={[styles.transactionItem,
      transaction.type === 'income' ? styles.incomeItem : styles.expenseItem
    ]}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text style={[styles.transactionAmount,
        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Management</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Club Balance</Text>
          <Text style={styles.balanceAmount}>{formatNumber(finances.balance)}</Text>
        </View>
      </View>

      {/* Financial Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Weekly Revenue</Text>
            <Text style={[styles.overviewAmount, styles.positive]}>
              {formatCurrency(finances.weeklyRevenue)}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Weekly Expenses</Text>
            <Text style={[styles.overviewAmount, styles.negative]}>
              {formatCurrency(finances.weeklyExpenses)}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Net Income</Text>
            <Text style={[styles.overviewAmount, getNetIncome() >= 0 ? styles.positive : styles.negative]}>
              {formatCurrency(getNetIncome())}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Transfer Budget</Text>
            <Text style={styles.overviewAmount}>
              {formatCurrency(finances.transferBudget)}
            </Text>
          </View>
        </View>
      </View>

      {/* Revenue Streams */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Streams</Text>
        {revenue_streams.map((stream, index) => (
          <View key={index} style={styles.streamItem}>
            <View style={styles.streamInfo}>
              <Text style={styles.streamName}>{stream.name}</Text>
              <Text style={styles.streamType}>{stream.type}</Text>
            </View>
            <Text style={styles.streamAmount}>{formatCurrency(stream.amount)}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.actionButton} onPress={handleSponsorshipDeal}>
          <Text style={styles.actionButtonText}>Negotiate Sponsorship Deal</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Expenses</Text>
        {expenses.map((expense, index) => (
          <View key={index} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>{expense.name}</Text>
              <Text style={styles.expenseType}>{expense.type}</Text>
            </View>
            <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </View>

      {/* Financial Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Goals</Text>
        <View style={styles.goalsContainer}>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Break even this season</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
            <Text style={styles.progressText}>65% Complete</Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>Increase revenue by 20%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.progressText}>40% Complete</Text>
          </View>
        </View>
      </View>

      {/* Sponsorship Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sponsorshipModal}
        onRequestClose={() => setSponsorshipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sponsorship Opportunities</Text>
            <View style={styles.sponsorshipOffers}>
              <TouchableOpacity style={styles.sponsorOffer}>
                <Text style={styles.sponsorName}>TechCorp Industries</Text>
                <Text style={styles.sponsorOffer}>€8M / 3 years</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sponsorOffer}>
                <Text style={styles.sponsorName}>Global Sports Brand</Text>
                <Text style={styles.sponsorOffer}>€12M / 5 years</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sponsorOffer}>
                <Text style={styles.sponsorName}>Local Bank</Text>
                <Text style={styles.sponsorOffer}>€4M / 2 years</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSponsorshipModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  balanceContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#f44336',
  },
  streamItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  streamType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  streamAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expenseType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  actionButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  goalItem: {
    marginBottom: 15,
  },
  goalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sponsorshipOffers: {
    width: '100%',
  },
  sponsorOffer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FinancialScreen;