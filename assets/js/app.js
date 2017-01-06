/*!
 * Pitchero Leaderboard
 * James Kirkby 2017 <james@jkirkby.co.uk>
 */

// import in dependancies
import React from 'react';
import ReactDOM from 'react-dom';

import Select from 'react-select';

// get the default data
import defaultData from './components/data.js';

// setup main class
class PitcheroLeaderboard extends React.Component {

  constructor() {

    super();

    this.state = {
      leaderboardHeaders: defaultData.headers,
      leaderboardRows: defaultData.body,
      selectedTeam: null,
      formElementsDisabled: true,
      editsMade: false,
    };


    this.changePoints = this.changePoints.bind(this);

    this.getTeamPointsFromName = this.getTeamPointsFromName.bind(this);

    this.handleSelectChange = this.handleSelectChange.bind(this);


  }

  cloneLeaderboards() {

    return JSON.parse(JSON.stringify(this.state.leaderboardRows));

  }

  leaderboardSortedByNumber() {

    let rows = this.cloneLeaderboards();

    rows.sort((a, b) => {
      return a.number - b.number;
    });

    return rows;

  }

  leaderboardSortedByName() {

    let rows = this.cloneLeaderboards();

    rows.sort((a, b) => {

      a = a.team.toLowerCase();
      b = b.team.toLowerCase();

      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      // team names must be equal
      return 0;

    });

    return rows;

  }

  leaderboardSortedByPointsThenNumber() {

    let rows = this.cloneLeaderboards();

    rows.sort((a, b) => {

      const points = b.points - a.points;

      if (points !== 0) {
        return points;
      }

      return a.number - b.number;

    });

    for(let i in rows) {
      rows[i].number = parseInt(i) + 1;
    }

    return rows;

  }

  changePoints(type, direction, value) {

    let currentLeaderboard = this.state.leaderboardRows;

    for (let i in currentLeaderboard) {

      if (currentLeaderboard[i].team === this.state.selectedTeam) {

        if(type === 'change') {

          if(direction === 'increase') {

            currentLeaderboard[i].points++;

          } else {

            currentLeaderboard[i].points--;

          }
        } else {

          this.state.leaderboardRows[i].points = value;

        }

        break;

      }

    }

    this.setState({
      leaderboard: currentLeaderboard,
      editsMade: true,
    });

  }

  getTeamPointsFromName() {

    if(this.state.selectedTeam == null) {
      return '';
    }

    for (let i in this.state.leaderboardRows) {

      if (this.state.leaderboardRows[i].team === this.state.selectedTeam) {

        return this.state.leaderboardRows[i].points;

      }

    }

  }

  handleSelectChange(team) {

    let formElementsDisabled;

    if(team !== null) {
      formElementsDisabled = false;
    } else {
      formElementsDisabled = true;
    }

    this.setState({
      selectedTeam: team,
      formElementsDisabled: formElementsDisabled,
    });

  }

  render() {

    let leaderboardRows = (this.state.editsMade ? this.leaderboardSortedByPointsThenNumber() : this.leaderboardSortedByNumber()),
        leaderboardNames = this.leaderboardSortedByName();

    let rows = [];

    leaderboardRows.forEach((row) => {
      rows.push(
        <tr key={row.number} className="leaderboard__row leaderboard__row--body">
          <td className="leaderboard__cell leaderboard__cell--body text--left">{row.number}</td>
          <td className="leaderboard__cell leaderboard__cell--body text--left">{row.team}</td>
          <td className="leaderboard__cell leaderboard__cell--body leaderboard__cell--body text--center">{row.played}</td>
          <td className="leaderboard__cell leaderboard__cell--body text--center">{row.points}</td>
        </tr>
      );
    });

    return (
      <div>
        <div className="form">
          <div className="form__input form__input--select">
            <label className="form__label">Select team to edit</label>
            <Select
              placeholder="Choose..."
              simpleValue
              options={leaderboardNames.map((row) => {
                return {
                    label: row.team,
                    value: row.team,
                };
              })}
              onChange={this.handleSelectChange}
              value={this.state.selectedTeam}
            />
          </div>
          <div className="form__input form__input--btn">
            <label className="form__label">Increase Points</label>
            <button
              className="btn form__btn form__btn--increase"
              onClick={() => {
                this.changePoints('change', 'increase');
              }}
              disabled={this.state.formElementsDisabled}
            >+</button>
          </div>
          <div className="form__input form__input--btn">
            <label className="form__label">Decrease Points</label>
            <button
              className="btn form__btn form__btn--decrease"
              onClick={() => {
                this.changePoints('change', 'decrease');
              }}
              disabled={this.state.formElementsDisabled}
            >-</button>
          </div>
          <div className="form__input form__input--input">
            <label className="form__label">Adjust Points</label>
            <input
              className="form__number"
              onChange={(e) => {
                this.changePoints('adjust', null, e.target.value);
              }}
              type="number"
              value={this.getTeamPointsFromName()}
              disabled={this.state.formElementsDisabled}
            />
          </div>
        </div>
        <table className="leaderboard">
          <thead className="leaderboard__head">
            <tr className="leaderboard__row leaderboard__row--head">
              <th className="leaderboard__cell leaderboard__cell--head text--left">{this.state.leaderboardHeaders.number}</th>
              <th className="leaderboard__cell leaderboard__cell--head text--left">{this.state.leaderboardHeaders.team}</th>
              <th className="leaderboard__cell leaderboard__cell--head text--center">{this.state.leaderboardHeaders.played}</th>
              <th className="leaderboard__cell leaderboard__cell--head text--center">{this.state.leaderboardHeaders.points}</th>
            </tr>
          </thead>
          <tbody className="leaderboard__body">
            {rows}
          </tbody>
        </table>
      </div>
    );

  }

}


// render the app to the view
ReactDOM.render(<PitcheroLeaderboard/>, document.getElementById('app'));