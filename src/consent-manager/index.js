import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ConsentManagerBuilder from '../consent-manager-builder'
import Container from './container'
import {ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES} from './categories'

export default class ConsentManager extends PureComponent {
  static displayName = 'ConsentManager'

  static propTypes = {
    writeKey: PropTypes.string.isRequired,
    otherWriteKeys: PropTypes.arrayOf(PropTypes.string),
    shouldEnforceConsent: PropTypes.func,
    implyConsentOnInteraction: PropTypes.bool,
    cookieDomain: PropTypes.string,
  }

  static defaultProps = {
    otherWriteKeys: [],
    shouldEnforceConsent: () => true,
    implyConsentOnInteraction: true,
    cookieDomain: undefined,
  }

  render() {
    const {
      writeKey,
      otherWriteKeys,
      shouldEnforceConsent,
      implyConsentOnInteraction,
      cookieDomain,
    } = this.props

    return (
      <ConsentManagerBuilder
        writeKey={writeKey}
        otherWriteKeys={otherWriteKeys}
        shouldEnforceConsent={shouldEnforceConsent}
        cookieDomain={cookieDomain}
        mapToPreferences={this.handleMapToPreferences}
        mapFromPreferences={this.handleMapFromPreferences}
      >
        {({
          destinations,
          newDestinations,
          preferences,
          isEnforcingConsent,
          setPreferences,
          saveConsent,
        }) => (
          <Container
            destinations={destinations}
            newDestinations={newDestinations}
            preferences={preferences}
            isEnforcingConsent={isEnforcingConsent}
            setPreferences={setPreferences}
            saveConsent={saveConsent}
            implyConsentOnInteraction={implyConsentOnInteraction}
          />
        )}
      </ConsentManagerBuilder>
    )
  }

  handleMapToPreferences = ({destinations, destinationPreferences}) => {
    const preferences = {
      marketingAllowed: false,
      advertisingAllowed: false,
      functionalAllowed: false,
    }

    if (!destinationPreferences) {
      return {
        marketingAllowed: true,
        advertisingAllowed: true,
        functionalAllowed: true,
      }
    }

    for (const destination of destinations) {
      const destinationPreference = destinationPreferences[destination.id]
      if (!destinationPreference) {
        continue
      }

      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        preferences.advertisingAllowed = true
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        preferences.functionalAllowed = true
      } else {
        // Fallback to marketing
        preferences.marketingAllowed = true
      }
    }

    return preferences
  }

  handleMapFromPreferences = ({destinations, preferences}) => {
    const destinationPreferences = {}

    for (const destination of destinations) {
      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        destinationPreferences[destination.id] = preferences.advertisingAllowed
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        destinationPreferences[destination.id] = preferences.functionalAllowed
      } else {
        // Fallback to marketing
        destinationPreferences[destination.id] = preferences.marketingAllowed
      }
    }

    return destinationPreferences
  }
}