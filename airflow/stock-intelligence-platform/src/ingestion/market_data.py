
import yfinance as yf


def fetch_stock_data(ticker, start=None, period="2y"):
    stock = yf.Ticker(ticker)

    if start is not None:
        data = stock.history(
            start=start,
            interval="1d",
            auto_adjust=False,
        )
    else:
        data = stock.history(
            period=period,
            interval="1d",
            auto_adjust=False,
        )

    if data.empty:
        print(f"Tidak ada data baru untuk {ticker}")
        return None

    data = data.dropna(subset=["Close"])
    data = data.reset_index()
    data["Ticker"] = ticker

    return data
