import yfinance as yf

ticker = yf.Ticker("BBCA.JK")

data = ticker.history(period="1mo")

print(data)