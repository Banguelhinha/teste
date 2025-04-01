const fs = require('fs');
const path = require('path');

// Caminho do arquivo de banco de dados
const dbFilePath = path.join(__dirname, '../database.json');

// Inicializar banco de dados
let db = {
    users: {}
};

// Buffer para armazenar alterações antes de salvar
let dbDirty = false;
let saveTimeout = null;

// Carregar banco de dados do arquivo se existir
function loadDatabase() {
    try {
        if (fs.existsSync(dbFilePath)) {
            const data = fs.readFileSync(dbFilePath, 'utf8');
            db = JSON.parse(data);
            console.log('Banco de dados carregado com sucesso');
        } else {
            console.log('Nenhum banco de dados existente, criando novo banco de dados');
            saveDatabase(true); // Força salvamento imediato
        }
    } catch (error) {
        console.error('Erro ao carregar banco de dados:', error);
    }
}

// Salvar banco de dados com otimização para não salvar frequentemente
function saveDatabase(immediate = false) {
    // Marcar que existem mudanças para salvar
    dbDirty = true;
    
    // Se já tem um salvamento agendado, não precisamos agendar outro
    if (saveTimeout && !immediate) return;
    
    // Limpar qualquer salvamento agendado anterior se for imediato
    if (immediate && saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
    
    // Função de salvamento real
    const performSave = () => {
        if (!dbDirty) return; // Se não há mudanças, não salva
        
        try {
            // Otimização: salvar sem formatação para arquivo menor
            fs.writeFileSync(dbFilePath, JSON.stringify(db), 'utf8');
            dbDirty = false;
            saveTimeout = null;
        } catch (error) {
            console.error('Erro ao salvar banco de dados:', error);
        }
    };
    
    // Salvar imediatamente ou agendar
    if (immediate) {
        performSave();
    } else {
        // Agenda salvamento para daqui 5 segundos
        saveTimeout = setTimeout(performSave, 5000);
    }
}

// Garantir que dados sejam salvos antes do programa terminar
process.on('SIGINT', () => {
    if (dbDirty) {
        saveDatabase(true);
    }
    process.exit();
});

// Função auxiliar para inicializar usuário
function initUser(userId) {
    if (!db.users[userId]) {
        db.users[userId] = { balance: 0 };
        return true; // Novo usuário criado
    }
    return false; // Usuário já existia
}

// Obter saldo do usuário - otimizado
function getUserBalance(userId) {
    if (initUser(userId)) saveDatabase();
    return db.users[userId].balance;
}

// Adicionar dinheiro ao usuário - otimizado
function addMoney(userId, amount) {
    initUser(userId);
    db.users[userId].balance += amount;
    saveDatabase();
    return db.users[userId].balance;
}

// Remover dinheiro do usuário - otimizado
function removeMoney(userId, amount) {
    initUser(userId);
    db.users[userId].balance = Math.max(0, db.users[userId].balance - amount);
    saveDatabase();
    return db.users[userId].balance;
}

// Obter ranking - otimizado para desempenho
function getRanking(limit = 10) {
    // Usando método rápido para pegar apenas os top usuários
    return Object.entries(db.users)
        .map(([id, data]) => ({ id, balance: data.balance }))
        .filter(user => user.balance > 0) // Ignorar usuários com saldo zero
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit); // Limitar apenas aos top usuários
}

// Inicializar DB na inicialização
loadDatabase();

// Agendar salvamento automático a cada 5 minutos para segurança
setInterval(() => {
    if (dbDirty) saveDatabase(true);
}, 300000);

module.exports = {
    getUserBalance,
    addMoney,
    removeMoney,
    getRanking
};
