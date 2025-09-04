-- Vibe Platform Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    gender VARCHAR(20),
    interested_in VARCHAR(20),
    location JSONB,
    bio TEXT,
    photos TEXT[],
    interests TEXT[],
    is_verified BOOLEAN DEFAULT false,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    safety_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    game_type VARCHAR(50) DEFAULT 'truth_or_dare',
    status VARCHAR(20) DEFAULT 'active',
    current_turn UUID,
    questions_asked JSONB[],
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    connection_made BOOLEAN DEFAULT false
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty_level INTEGER DEFAULT 1,
    age_restriction INTEGER DEFAULT 18,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    game_id UUID REFERENCES games(id),
    status VARCHAR(20) DEFAULT 'active',
    matched_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW()
);
