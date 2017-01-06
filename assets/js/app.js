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

    // assign some defaults to the state
    this.state = {
      leaderboardHeaders: defaultData.headers,
      leaderboardRows: defaultData.body,
      selectedTeam: null,
      formElementsDisabled: true,
    };

    // bind custom functions
    this.changePoints = this.changePoints.bind(this);

    this.getTeamPointsFromName = this.getTeamPointsFromName.bind(this);

    this.handleSelectChange = this.handleSelectChange.bind(this);


  }

  cloneLeaderboards() {

    // simple clone, instead of referencing the original object
    // because we're sorting the data in different ways (the dropdown displays
    // the names in alphabetical order, whereas the actual leaderboard table
    // displays the rows by their number or points, then their original position)
    // without doing this, the leaderboardRows variable in the state is displayed
    // in the wrong order in one of those places
    return JSON.parse(JSON.stringify(this.state.leaderboardRows));

  }

  leaderboardSortedByName() {

    // get the rows
    let rows = this.cloneLeaderboards();

    // sort the rows, based on the name of the team
    rows.sort((a, b) => {

      a = a.team.toLowerCase();
      b = b.team.toLowerCase();

      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      // team names must be equal, which would be weird
      return 0;

    });

    return rows;

  }

  leaderboardRowsSortedByPointsThenNumber() {

    // get the rows
    let rows = this.cloneLeaderboards(),
        tableRows = [];

    // sort the rows, based on the points
    // if the points are equal, sort the rows based on their current position
    rows.sort((a, b) => {

      const points = b.points - a.points;

      if (points !== 0) {
        return points;
      }

      return a.number - b.number;

    });

    // update the value for each position, now that it's been sorted
    for(let i in rows) {
      rows[i].number = parseInt(i) + 1;
    }

    // these are only to be used in the table, so we may as well generate
    // the HTML in this function
    rows.forEach((row) => {
      tableRows.push(
        <tr key={row.number} className="leaderboard__row leaderboard__row--body">
          <td className="leaderboard__cell leaderboard__cell--body text--left">{row.number}</td>
          <td className="leaderboard__cell leaderboard__cell--body text--left">{row.team}</td>
          <td className="leaderboard__cell leaderboard__cell--body leaderboard__cell--body text--center">{row.played}</td>
          <td className="leaderboard__cell leaderboard__cell--body text--center">{row.points}</td>
        </tr>
      );
    });

    return tableRows;

  }

  changePoints(type, direction, value) {

    // loop through all the rows to find the one we want to edit
    for (let i in this.state.leaderboardRows) {

      if (this.state.leaderboardRows[i].team === this.state.selectedTeam) {

        // this function will update the score using both the buttons
        // and the number input, so the `type` paramater tells us how to update
        // 'change' is used by the buttons, 'adjust' is used by the input
        if(type === 'change') {

          // each button passes through another paramater, the `direction` param
          // which tells us to increase or decrease the score
          if(direction === 'increase') {

            this.state.leaderboardRows[i].points++;

          } else {

            this.state.leaderboardRows[i].points--;

          }
        } else {

          // if we're adjusting, using the number input, just use the value
          // that's been passed through
          this.state.leaderboardRows[i].points = value;

        }

        break;

      }

    }

    // update the leaderboardRows value in the state
    this.setState({
      leaderboardRows: this.state.leaderboardRows,
    });

  }

  getTeamPointsFromName() {

    // if a team hasn't been selected, display an empty value in the number input
    if(this.state.selectedTeam == null) {
      return '';
    }

    // loop through all the teams to find the current one
    for (let i in this.state.leaderboardRows) {

      if (this.state.leaderboardRows[i].team === this.state.selectedTeam) {

        // return the current points for that team
        return this.state.leaderboardRows[i].points;

      }

    }

  }

  handleSelectChange(team) {

    // update the current selected team when the dropdown changes
    // if no team is selected, then null is used for the `team` parameter
    // disable the other form elements if a team hasn't been selected
    this.setState({
      selectedTeam: team,
      formElementsDisabled: !(team !== null),
    });

  }

  render() {

    return (
      <div>
        <div className="form">
          <div className="form__input form__input--select">
            <label className="form__label">Select team to edit</label>
            <Select
              placeholder="Choose..."
              simpleValue
              options={this.leaderboardSortedByName().map((row) => {
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
            {this.leaderboardRowsSortedByPointsThenNumber()}
          </tbody>
        </table>
      </div>
    );

  }

}

// render the app to the view
ReactDOM.render(<PitcheroLeaderboard/>, document.getElementById('app'));