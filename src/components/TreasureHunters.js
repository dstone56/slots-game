import React, { useState, useEffect } from 'react';
import '../styles/SlotMachine.css';
import coin from '../images/Coin.png';
import treasureChestBackground from '../images/TresureChest.webp'; // Import the background image
import tropicalBeachBackground from '../images/TropicalBeach.jpg.avif';
import border1 from '../images/Border.png';
import border2 from '../images/Border.png';
import border3 from '../images/Border.png';
import border4 from '../images/Border.png';
import border5 from '../images/Border.png';

const symbols = ['🍊', '🍒', '🍇', '🍌', '🍉'];

const titleStyle = {
    position: 'absolute',
    top: '0px',
    fontSize: '5em',
    color: 'gold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Add a subtle shadow
    fontFamily: 'Luminari, fantasy',
    radius: 300,
    dir: 1,
  };

const containerStyle = {
    background: `
      url(${border1}) 301px 128px / 210px 372px no-repeat,
      url(${border2}) 461px 128px / 210px 372px no-repeat,
      url(${border3}) 621px 128px / 210px 372px no-repeat,
      url(${border4}) 781px 128px / 210px 372px no-repeat,
      url(${border5}) 941px 128px / 210px 372px no-repeat,
      url(${treasureChestBackground}) 325px -50px / 800px 950px no-repeat, 
      url(${tropicalBeachBackground}) center center / cover no-repeat
    `,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

const initializeArray = (symbols) => {
    const array = new Array(3);

    for (let i = 0; i < array.length; i++) {
        array[i] = new Array(5);
        for (let j = 0; j < array[i].length; j++) {
            array[i][j] = symbols[Math.floor(Math.random() * symbols.length)];
        }
    }

    return array;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TreasureHunters = ({ symbols }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [displayedSymbols, setDisplayedSymbols] = useState(initializeArray(symbols));
    const [goodLuckText, setGoodLuckText] = useState('');
    const [winMessage, setWinMessage] = useState('');
    const [winTypes, setWinTypes] = useState([]);
    const [winningIndexes, setWinningIndexes] = useState([]);
    const [totalCoins, setTotalCoins] = useState(100); // Initial coins
    const [selectedCentDenomination, setSelectedCentDenomination] = useState(10); // Default denomination
    const [totalWin, setTotalWin] = useState(0);

    const spinDuration = 3000; // Total spin duration in milliseconds

    

    const handleSpinClick = async () => {
        if (!isSpinning && totalCoins >= selectedCentDenomination) {
            setIsSpinning(true);
            setWinMessage('');
            setGoodLuckText('Good Luck!');
            setWinTypes([]);
            setWinningIndexes([]);

            const stopTimes = Array.from({ length: 3 }, (_, i) => i * 1000);
            const stoppingPromise = stopTimes.map((stopTime, rowIndex) => {
                return new Promise(async (resolve) => {
                    await delay(stopTime);
                    resolve();
                });
            });

            // Start changing symbols for all rows at once
            const symbolChangePromises = Array.from({ length: 3 }, (_, rowIndex) => {
                return generateSymbolsForColumn(rowIndex, spinDuration);
            });

            await Promise.all(symbolChangePromises); // Wait for all symbols to change
            await Promise.all(stoppingPromise); // Wait for all rows to stop

            setIsSpinning(false);
            setGoodLuckText('');

            const isWinner = checkForWinner();

            if (isWinner) {
                if (displayedSymbols.flat().every((symbol) => symbol === symbols[3])) {
                    setWinMessage('No win');
                } else {
                    // Calculate the win based on the selected cent denomination and symbols displayed
                    const symbolsCount = displayedSymbols.flat().filter((symbol) => symbol !== symbols[3]).length;
                    const winAmount = symbolsCount * (selectedCentDenomination / 10);
                    setWinMessage(`Win: $${winAmount.toFixed(2)}`);
                    setTotalCoins(totalCoins + winAmount); // Add the win to total coins
                    setTotalWin(totalWin + winAmount);
                }
            } else {
                // Deduct the cost of the spin from total coins
                setTotalCoins(totalCoins - selectedCentDenomination);
            }
        }
    };

    const generateSymbolsForColumn = async (rowIndex, duration) => {
        const newDisplayedSymbols = [...displayedSymbols];

        // Start changing symbols for the given row
        const symbolChangePromise = new Promise((resolve) => {
            const intervalId = setInterval(() => {
                for (let colIndex = 0; colIndex < 5; colIndex++) {
                    newDisplayedSymbols[rowIndex][colIndex] = symbols[Math.floor(Math.random() * symbols.length)];
                }
                setDisplayedSymbols([...newDisplayedSymbols]);
            }, 50); // Adjust the interval for how fast symbols change

            // Stop changing symbols after the specified duration
            setTimeout(() => {
                clearInterval(intervalId);
                resolve();
            }, duration);
        });

        return symbolChangePromise;
    };

    const checkForWinner = () => {
        const rowCount = displayedSymbols.length;
        const colCount = displayedSymbols[0].length;
        const newWinTypes = [];
        const newWinningIndexes = [];
        let winCount = 0;
        let rowWin = false;
        let colWin = false;
        let diagonalWin = false;

        // Check rows for a win
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            for (let colIndex = 0; colIndex <= colCount - 5; colIndex++) {
                const slice = displayedSymbols[rowIndex].slice(colIndex, colIndex + 5);
                if (slice.every((symbol) => symbol === slice[0] && symbol !== symbols[-1])) {
                    newWinTypes.push('Row Win (5 in a row)');
                    newWinningIndexes.push(slice.map((_, i) => [rowIndex, colIndex + i]))
                    winCount = winCount + 1;
                }
            }

            for (let colIndex = 0; colIndex <= colCount - 4; colIndex++) {
                const slice = displayedSymbols[rowIndex].slice(colIndex, colIndex + 4);
                if (slice.every((symbol) => symbol === slice[0] && symbol !== symbols[-1])) {
                    newWinTypes.push('Row Win (4 in a row)');
                    newWinningIndexes.push(slice.map((_, i) => [rowIndex, colIndex + i]))
                    winCount = winCount + 1;;
                }
            }

            for (let colIndex = 0; colIndex <= colCount - 3; colIndex++) {
                const slice = displayedSymbols[rowIndex].slice(colIndex, colIndex + 3);
                if (slice.every((symbol) => symbol === slice[0] && symbol !== symbols[-1])) {
                    newWinTypes.push('Row Win (3 in a row)');
                    newWinningIndexes.push(slice.map((_, i) => [rowIndex, colIndex + i]))
                    winCount = winCount + 1;;
                }
            }
        }

        // Check columns for a win
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
            for (let rowIndex = 0; rowIndex <= rowCount - 3; rowIndex++) {
                const symbolsToCheck = [
                    displayedSymbols[rowIndex][colIndex],
                    displayedSymbols[rowIndex + 1][colIndex],
                    displayedSymbols[rowIndex + 2][colIndex]
                ];

                if (symbolsToCheck.every((symbol) => symbol === symbolsToCheck[0] && symbol !== symbols[-1])) {
                    newWinTypes.push('Column Win (3 in a row)');
                    newWinningIndexes.push([
                        [rowIndex, colIndex],
                        [rowIndex + 1, colIndex],
                        [rowIndex + 2, colIndex]
                    ])
                    winCount = winCount + 1;
                }
            }
        }

        // Check diagonals for a win (left to right and right to left)
        for (let rowIndex = 0; rowIndex <= rowCount - 3; rowIndex++) {
            for (let colIndex = 0; colIndex <= colCount - 3; colIndex++) {
                const symbolsToCheckDiagonal = [
                    displayedSymbols[rowIndex][colIndex],
                    displayedSymbols[rowIndex + 1][colIndex + 1],
                    displayedSymbols[rowIndex + 2][colIndex + 2]
                ];

                const symbolsToCheckAntiDiagonal = [
                    displayedSymbols[rowIndex][colIndex + 2],
                    displayedSymbols[rowIndex + 1][colIndex + 1],
                    displayedSymbols[rowIndex + 2][colIndex]
                ];

                if (
                    symbolsToCheckDiagonal.every((symbol) => symbol === symbolsToCheckDiagonal[0] && symbol !== symbols[-1])
                    || symbolsToCheckAntiDiagonal.every((symbol) => symbol === symbolsToCheckAntiDiagonal[0] && symbol !== symbols[-1])
                ) {
                    newWinTypes.push('Diagonal Win (3 in a row)');
                    newWinningIndexes.push(
                        symbolsToCheckDiagonal.every((symbol) => symbol === symbolsToCheckDiagonal[0] && symbol !== symbols[-1])
                            ? [
                                [rowIndex, colIndex],
                                [rowIndex + 1, colIndex + 1],
                                [rowIndex + 2, colIndex + 2]
                            ]
                            : [
                                [rowIndex, colIndex + 2],
                                [rowIndex + 1, colIndex + 1],
                                [rowIndex + 2, colIndex]
                            ]
                    );
                    winCount = winCount + 1;
                }
            }
        }

        if (rowWin || colWin || diagonalWin) {
            winCount++;
        }

        if (winCount === 1) {
            setWinMessage('Win!');
        } else if (winCount === 2) {
            setWinMessage('Big Win!');
        } else if (winCount === 3) {
            setWinMessage('Huge Win!');
        } else if (winCount === 4) {
            setWinMessage('Giant Win!');
        } else if (winCount >= 5) {
            setWinMessage('Massive Win!');
        } else {
            setWinMessage('');
        }

        setWinTypes(newWinTypes);
        setWinningIndexes(newWinningIndexes);
        return newWinTypes.length > 0;


    };

    useEffect(() => {
        if (displayedSymbols.every((row) => row.every((symbol) => symbol === symbols[-1]))) {
            setIsSpinning(false);
        }
    }, [displayedSymbols, symbols]);


    return (
        <div className="slot-machine-container">
            <div className="slot-machine">
                {/* Display the player's total coins */}
                <div className="total-coins">
                    <span>${totalCoins.toFixed(2)}</span>
                    <span className="coin-rotation">
                        <img src={coin} alt="Coin" />
                    </span>
                </div>
                {/* Display the player's selected cent denomination */}
                <div className="selected-denomination">
                </div>
                {displayedSymbols.map((row, rowIndex) => (
                    <div key={rowIndex} className="slot-row">
                        {row.map((symbol, colIndex) => {
                            const isWinningSymbol = winningIndexes.some((indexes) =>
                                indexes.some(([winRowIndex, winColIndex]) => winRowIndex === rowIndex && winColIndex === colIndex)
                            );

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`box ${isWinningSymbol ? 'winning-symbol' : ''}`}
                                >
                                    {symbol}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="good-luck-text">{goodLuckText}</div>
            {winMessage && <div className="win-message-text">{winMessage}</div>}
            {winTypes.length > 0 && !winMessage && (
                <div className="win-type">
                    <br />
                    {winningIndexes.map((indexes, index) => (
                        <span key={index}>
                            <br />
                        </span>
                    ))}
                </div>
            )}
            {/* Display buttons to select the cent denomination */}
            <div className="denomination-buttons">
                <button
                    onClick={() => setSelectedCentDenomination(10)}
                    className={`denomination10-buttons ${selectedCentDenomination === 10 ? 'selected' : ''}`}
                >
                    10¢
                </button>
                <button
                    onClick={() => setSelectedCentDenomination(20)}
                    className={`denomination20-buttons ${selectedCentDenomination === 20 ? 'selected' : ''}`}
                >
                    20¢
                </button>
                <button
                    onClick={() => setSelectedCentDenomination(50)}
                    className={`denomination50-buttons ${selectedCentDenomination === 50 ? 'selected' : ''}`}
                >
                    50¢
                </button>
            </div>
            {/* Display the spin button */}
            <div className="button-container">
                <button className="button" onClick={handleSpinClick} disabled={isSpinning}>
                    Spin
                </button>
            </div>
        </div>
    );
};

export {
    TreasureHunters,
    containerStyle,
    titleStyle,
    symbols,
  };
