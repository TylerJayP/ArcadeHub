class TokenManager {
  static STORAGE_KEY = 'arcade_tokens';
  static MAX_TOKENS = 10;

  static getTokens() {
    const tokens = localStorage.getItem(this.STORAGE_KEY);
    return tokens ? parseInt(tokens, 10) : 0;
  }

  static setTokens(amount) {
    const tokens = Math.min(Math.max(0, amount), this.MAX_TOKENS);
    localStorage.setItem(this.STORAGE_KEY, tokens.toString());
    return tokens;
  }

  static addTokens(amount) {
    const current = this.getTokens();
    return this.setTokens(current + amount);
  }

  static spendToken() {
    const current = this.getTokens();
    if (current > 0) {
      return this.setTokens(current - 1);
    }
    return current;
  }

  static hasTokens() {
    return this.getTokens() > 0;
  }

  static resetTokens() {
    return this.setTokens(0);
  }
}

export default TokenManager;
