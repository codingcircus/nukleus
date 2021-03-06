import React, {PropTypes} from 'react';
import Autosuggest from 'react-autosuggest';
import Scroll from 'react-scroll';

import styles from './index.scss';

import getElementPositionY from '../../utils/elementPosition';
import isMobile from '../../utils/mobileDetection';
import {
  controlLabel,
  controlLabelRequired,
  controlNote,
  errorStyles,
  formControl,
  hidden,
  formGroup,
  srOnly
} from '../index.scss';

export default class Autocomplete extends React.Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    data: PropTypes.object,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    id: PropTypes.string.isRequired,
    inputStyle: PropTypes.string,
    isRequired: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelHidden: PropTypes.bool,
    name: PropTypes.string.isRequired,
    noSuggestionText: PropTypes.string,
    onGetSuggestions: PropTypes.func,
    onSelectSuggestion: PropTypes.func,
    placeholder: PropTypes.string,
    query: PropTypes.object,
    requiredLabel: PropTypes.string,
    scrollOffset: PropTypes.number,
    scrollTo: PropTypes.bool,
    submitOnEnter: PropTypes.bool,
    value: PropTypes.string
  };

  static defaultProps = {
    autoFocus: false,
    data: {},
    disabled: false,
    error: null,
    inputStyle: 'inline',
    isRequired: false,
    labelHidden: false,
    noSuggestionText: 'No results found',
    onGetSuggestions: null,
    onSelectSuggestion: null,
    placeholder: '',
    query: {},
    requiredLabel: '',
    scrollOffset: 0,
    scrollTo: false,
    submitOnEnter: false,
    value: ''
  }

  state = {
    showError: false,
    showNoSuggestionsText: false,
    suggestions: this.props.data.items || [],
    value: ''
  };

  componentWillMount () {
    this.updateValue(this.props.query[this.props.name] || this.props.value || '');
  }

  componentWillReceiveProps (nextProps) {
    if (JSON.stringify(nextProps.data.items) !== JSON.stringify(this.props.data.items)) {
      this.setState({suggestions: nextProps.data.items});
    }
    if (!this.needsUpdate(nextProps)) return;
    if (nextProps.error) this.showError();
    this.updateValue(this.props.query[this.props.name] || nextProps.value || '');
  }

  onChange = (event, {newValue}) => {
    this.setState({
      showNoSuggestionsText: true,
      value: newValue
    });
    this.hideError();
  }

  onFocus = () => {
    this.scrollToElement();
  }

  onBlur = () => {
    this.hideNoSuggestionsText();
  }

  onSuggestionsFetchRequested = ({value}) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (e, {method, suggestion}) => {
    this.setState({
      showNoSuggestionsText: false
    });

    if (method === 'enter' && !this.props.submitOnEnter) {
      e.preventDefault();
    }

    if (this.props.onSelectSuggestion) {
      this.props.onSelectSuggestion(suggestion);
    }
  }

  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if (inputValue) {
      if (this.props.onGetSuggestions) {
        this.props.onGetSuggestions(inputValue);
        return this.props.data.items;
      }

      return this.props.data.items.filter(data => data.item.toLowerCase().slice(0, inputLength) === inputValue);
    }

    return [];
  }

  getSuggestionValue = suggestion => suggestion.item;

  hideNoSuggestionsText = () => {
    this.setState({
      showNoSuggestionsText: false
    });
  }

  showError () {
    this.setState({
      showError: true
    });
  }

  hideError () {
    this.setState({
      showError: false
    });
  }

  scrollToElement = () => {
    if (this.props.scrollTo && isMobile) {
      const elementPos = getElementPositionY(this.node, this.props.scrollOffset);
      const scroll = Scroll.animateScroll;
      scroll.scrollTo(elementPos);
    }
  }

  needsUpdate ({value, query}) {
    return (
      value !== this.props.value ||
      query !== this.props.query
    );
  }

  updateValue (value) {
    this.setState({value});
  }

  renderSuggestion = suggestion => <span>{suggestion.item}<span className={styles.suggestionInfo}>&nbsp;({suggestion.itemInfo})</span></span>;

  render () {
    const {
      autoFocus,
      data: {isFetching},
      disabled,
      error,
      label,
      labelHidden,
      id,
      isRequired,
      name,
      noSuggestionText,
      placeholder,
      requiredLabel
    } = this.props;

    const {
      showError,
      showNoSuggestionsText,
      suggestions,
      value
    } = this.state;

    const inputProps = {
      autoFocus,
      className: formControl,
      disabled,
      id,
      name,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onFocus: this.onFocus,
      placeholder,
      required: isRequired,
      value
    };

    return (
      <div
        ref={node => this.node = node}
        className={`${formGroup} ${styles[this.props.inputStyle]} ${requiredLabel ? styles.paddingTop : ''}`}>

        {requiredLabel &&
          <span className={`${controlNote} ${controlLabelRequired}`}>
            {requiredLabel}
          </span>
        }

        {labelHidden &&
          <span className={srOnly}>
            {label}
          </span>
        }

        <label
          className={`${controlLabel} ${labelHidden && hidden}`}
          htmlFor={id}>
          {label}
        </label>

        <div className={styles.autoCompleteContainer}>
          <Autosuggest
            focusFirstSuggestion
            focusInputOnSuggestionClick={!isMobile}
            getSuggestionValue={this.getSuggestionValue}
            inputProps={inputProps}
            onSuggestionSelected={this.onSuggestionSelected}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            renderSuggestion={this.renderSuggestion}
            suggestions={suggestions}
            theme={styles} />

          {isFetching &&
            <span className={styles.spinner}>
              <i
                className="fa fa-spinner fa-pulse fa-3x fa-fw"
                aria-hidden="true" />
            </span>
          }

          {!isFetching && !suggestions.length && value && showNoSuggestionsText ?
            <div className={styles.suggestionsContainer}>
              <ul>
                <li className={styles.suggestion}>
                  {noSuggestionText}
                </li>
              </ul>
            </div>
            : ''
          }

          {showError &&
            <span className={errorStyles}>
              {error}
            </span>
          }
        </div>
      </div>
    );
  }
}
