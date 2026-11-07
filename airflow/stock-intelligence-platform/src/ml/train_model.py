
import pandas as pd

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

from src.database.connection import get_connection


FEATURE_COLUMNS = [
    "daily_return",
    "price_to_sma_5",
    "price_to_sma_10",
    "price_to_sma_20",
    "momentum_5",
    "momentum_10",
    "rsi_14",
    "volatility_20",
    "volume_ratio_20",
]

THRESHOLD = 0.50
EMBARGO_DAYS = 5


def load_dataset():
    conn = get_connection()

    query = """
        SELECT
            sf.ticker,
            sf.trade_date,
            sf.daily_return,
            sf.price_to_sma_5,
            sf.price_to_sma_10,
            sf.price_to_sma_20,
            sf.momentum_5,
            sf.momentum_10,
            sf.rsi_14,
            sf.volatility_20,
            sf.volume_ratio_20,
            sl.target_up_5d
        FROM stock_features sf
        INNER JOIN stock_labels sl
            ON sf.ticker = sl.ticker
            AND sf.trade_date = sl.trade_date
        WHERE sl.target_up_5d IS NOT NULL
        ORDER BY sf.trade_date, sf.ticker
    """

    try:
        df = pd.read_sql_query(query, conn)
    finally:
        conn.close()

    return df


def split_dataset(df):
    dates = sorted(df["trade_date"].unique())

    split_index = int(len(dates) * 0.80)

    train_dates = dates[:split_index - EMBARGO_DAYS]
    test_dates = dates[split_index:]

    train_df = df[df["trade_date"].isin(train_dates)].copy()
    test_df = df[df["trade_date"].isin(test_dates)].copy()

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["target_up_5d"]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["target_up_5d"]

    print("\n========== DATA SPLIT ==========")
    print(f"Total dates : {len(dates)}")
    print(f"Train rows  : {len(train_df)}")
    print(f"Test rows   : {len(test_df)}")
    print(f"Train start : {train_df['trade_date'].min()}")
    print(f"Train end   : {train_df['trade_date'].max()}")
    print(f"Test start  : {test_df['trade_date'].min()}")
    print(f"Test end    : {test_df['trade_date'].max()}")

    return X_train, X_test, y_train, y_test, train_df, test_df


def build_model():
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        (
            "classifier",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
            ),
        ),
    ])


def evaluate_model(model, X_test, y_test):
    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= THRESHOLD).astype(int)

    metrics = {
        "accuracy": accuracy_score(y_test, predictions),
        "precision": precision_score(
            y_test, predictions, zero_division=0
        ),
        "recall": recall_score(
            y_test, predictions, zero_division=0
        ),
        "f1": f1_score(
            y_test, predictions, zero_division=0
        ),
        "roc_auc": roc_auc_score(y_test, probabilities),
    }

    print("\n========== LOGISTIC REGRESSION ==========")
    print(f"Threshold : {THRESHOLD}")
    print(f"Accuracy  : {metrics['accuracy']:.4f}")
    print(f"Precision : {metrics['precision']:.4f}")
    print(f"Recall    : {metrics['recall']:.4f}")
    print(f"F1 Score  : {metrics['f1']:.4f}")
    print(f"ROC-AUC   : {metrics['roc_auc']:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    return metrics


def save_evaluation(metrics, train_df, test_df):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO model_evaluations (
            model_name,
            train_start_date,
            train_end_date,
            test_start_date,
            test_end_date,
            accuracy,
            precision_score,
            recall_score,
            f1_score,
            roc_auc
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        "logistic_regression_baseline",
        train_df["trade_date"].min(),
        train_df["trade_date"].max(),
        test_df["trade_date"].min(),
        test_df["trade_date"].max(),
        metrics["accuracy"],
        metrics["precision"],
        metrics["recall"],
        metrics["f1"],
        metrics["roc_auc"],
    )

    try:
        cursor.execute(query, values)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    print("\nEvaluation saved to database.")


def main():
    print("Loading dataset...")

    df = load_dataset()

    print(f"Total rows: {len(df)}")

    (
        X_train,
        X_test,
        y_train,
        y_test,
        train_df,
        test_df,
    ) = split_dataset(df)

    print("\nTraining Logistic Regression...")

    model = build_model()
    model.fit(X_train, y_train)

    metrics = evaluate_model(model, X_test, y_test)

    save_evaluation(metrics, train_df, test_df)

    print("\nTraining completed.")


if __name__ == "__main__":
    main()
