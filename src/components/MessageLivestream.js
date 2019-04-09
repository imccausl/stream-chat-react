import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Avatar } from './Avatar';
import { Attachment } from './Attachment';
import { MessageActionsBox } from './MessageActionsBox';
import { ReactionSelector } from './ReactionSelector';
import { SimpleReactionsList } from './SimpleReactionsList';
import { MessageInput } from './MessageInput';
import { EditMessageForm } from './EditMessageForm';
import { Gallery } from './Gallery';
import { MessageRepliesCountButton } from './MessageRepliesCountButton';

import { isOnlyEmojis, renderText } from '../utils';

const reactionSvg =
  '<svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.108 8.05a.496.496 0 0 1 .212.667C10.581 10.147 8.886 11 7 11c-1.933 0-3.673-.882-4.33-2.302a.497.497 0 0 1 .9-.417C4.068 9.357 5.446 10 7 10c1.519 0 2.869-.633 3.44-1.738a.495.495 0 0 1 .668-.212zm.792-1.826a.477.477 0 0 1-.119.692.541.541 0 0 1-.31.084.534.534 0 0 1-.428-.194c-.106-.138-.238-.306-.539-.306-.298 0-.431.168-.54.307A.534.534 0 0 1 9.538 7a.544.544 0 0 1-.31-.084.463.463 0 0 1-.117-.694c.33-.423.742-.722 1.394-.722.653 0 1.068.3 1.396.724zm-7 0a.477.477 0 0 1-.119.692.541.541 0 0 1-.31.084.534.534 0 0 1-.428-.194c-.106-.138-.238-.306-.539-.306-.299 0-.432.168-.54.307A.533.533 0 0 1 2.538 7a.544.544 0 0 1-.31-.084.463.463 0 0 1-.117-.694c.33-.423.742-.722 1.394-.722.653 0 1.068.3 1.396.724zM7 0a7 7 0 1 1 0 14A7 7 0 0 1 7 0zm4.243 11.243A5.96 5.96 0 0 0 13 7a5.96 5.96 0 0 0-1.757-4.243A5.96 5.96 0 0 0 7 1a5.96 5.96 0 0 0-4.243 1.757A5.96 5.96 0 0 0 1 7a5.96 5.96 0 0 0 1.757 4.243A5.96 5.96 0 0 0 7 13a5.96 5.96 0 0 0 4.243-1.757z" fillRule="evenodd"/></svg>';
const threadSvg =
  '<svg width="14" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M8.516 3c4.78 0 4.972 6.5 4.972 6.5-1.6-2.906-2.847-3.184-4.972-3.184v2.872L3.772 4.994 8.516.5V3zM.484 5l4.5-4.237v1.78L2.416 5l2.568 2.125v1.828L.484 5z" fillRule="evenodd" /></svg>';
const optionsSvg =
  '<svg width="11" height="3" viewBox="0 0 11 3" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fillRule="nonzero" /></svg>';

/**
 * MessageLivestream - Render component, should be used together with the Message component
 * Implements the look and feel for a livestream use case.
 *
 * @example ./docs/MessageLivestream.md
 * @extends PureComponent
 */
export class MessageLivestream extends React.PureComponent {
  static propTypes = {
    /** The message object */
    message: PropTypes.object,
    /** The attachment component */
    Attachment: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /** The message component, most logic is delegated to this component */
    Message: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.object,
    ]).isRequired,
  };

  static defaultProps = {
    Attachment,
  };

  state = {
    actionsBoxOpen: false,
    reactionSelectorOpen: false,
  };

  reactionSelectorRef = React.createRef();
  editMessageFormRef = React.createRef();

  isMine() {
    return this.props.Message.isMyMessage(this.props.message);
  }

  onClickReactionsAction = () => {
    this.setState(
      {
        reactionSelectorOpen: true,
      },
      () => document.addEventListener('click', this.hideReactions, false),
    );
  };

  onClickOptionsAction = () => {
    this.setState(
      {
        actionsBoxOpen: true,
      },
      () => document.addEventListener('click', this.hideOptions, false),
    );
  };

  hideOptions = () => {
    this.setState({
      actionsBoxOpen: false,
    });
    document.removeEventListener('click', this.hideOptions, false);
  };

  hideReactions = (e) => {
    if (
      !this.reactionSelectorRef.current.reactionSelector.current.contains(
        e.target,
      )
    ) {
      this.setState({
        reactionSelectorOpen: false,
      });
      document.removeEventListener('click', this.hideReactions, false);
    }
  };

  onMouseLeaveMessage = () => {
    this.hideOptions();
    this.setState(
      {
        reactionSelectorOpen: false,
      },
      () => document.removeEventListener('click', this.hideReactions, false),
    );
  };

  componentWillUnmount() {
    document.removeEventListener('click', this.hideOptions, false);
    document.removeEventListener('click', this.hideReactions, false);
  }

  render() {
    const { Attachment, message, groupStyles } = this.props;
    const hasAttachment = Boolean(
      message.attachments && message.attachments.length,
    );

    let galleryImages = message.attachments.filter(
      (item) => item.type === 'image',
    );
    let attachments = message.attachments;
    if (galleryImages.length > 1) {
      attachments = message.attachments.filter((item) => item.type !== 'image');
    } else {
      galleryImages = [];
    }

    if (message.type === 'message.read') {
      return null;
    }

    if (message.type === 'message.date') {
      return null;
    }

    if (message.deleted_at) {
      return null;
    }

    if (this.props.editing) {
      return (
        <div
          className={`str-chat__message-team str-chat__message-team--${
            groupStyles[0]
          } str-chat__message-team--editing`}
          onMouseLeave={this.onMouseLeaveMessage}
        >
          {(groupStyles[0] === 'top' || groupStyles[0] === 'single') && (
            <div className="str-chat__message-team-meta">
              <Avatar
                image={message.user.image}
                name={message.user.name || message.user.id}
                size={40}
              />
            </div>
          )}
          <MessageInput
            Input={EditMessageForm}
            message={this.props.message}
            clearEditingState={this.props.clearEditingState}
            updateMessage={this.props.updateMessage}
          />
        </div>
      );
    }

    return (
      <React.Fragment>
        <div
          className={`str-chat__message-livestream str-chat__message-livestream--${
            groupStyles[0]
          } str-chat__message-livestream--${
            message.type
          } str-chat__message-livestream--${message.status} ${
            this.props.initialMessage
              ? 'str-chat__message-livestream--initial-message'
              : ''
          }`}
          onMouseLeave={this.onMouseLeaveMessage}
        >
          {this.state.reactionSelectorOpen && (
            <ReactionSelector
              mine={this.props.mine}
              reverse={false}
              handleReaction={this.props.handleReaction}
              actionsEnabled={this.props.actionsEnabled}
              detailedView
              latest_reactions={message.latest_reactions}
              reaction_counts={message.reaction_counts}
              messageList={this.props.messageListRect}
              ref={this.reactionSelectorRef}
            />
          )}
          {!this.props.initialMessage && message.type !== 'error' && (
            <div className={`str-chat__message-livestream-actions`}>
              <span className={`str-chat__message-livestream-time`}>
                {moment(message.created_at).format('h:mmA')}
              </span>
              <span onClick={this.onClickReactionsAction}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: reactionSvg,
                  }}
                />
              </span>
              {!this.props.threadList && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: threadSvg,
                  }}
                  onClick={(e) => this.props.openThread(e, message)}
                />
              )}
              <span onClick={this.onClickOptionsAction}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: optionsSvg,
                  }}
                />
                <MessageActionsBox
                  open={this.state.actionsBoxOpen}
                  Message={this.props.Message}
                  message={this.props.message}
                  messageListRect={this.props.messageListRect}
                  mine={this.props.Message.isMyMessage(this.props.message)}
                />
              </span>
            </div>
          )}

          <div className={`str-chat__message-livestream-left`}>
            <Avatar
              image={message.user.image}
              name={message.user.name || message.user.id}
              size={30}
            />
          </div>
          <div className={`str-chat__message-livestream-right`}>
            <div className={`str-chat__message-livestream-content`}>
              <div className="str-chat__message-livestream-author">
                <strong>{message.user.name || message.user.id}</strong>
                {message.type === 'error' && (
                  <div className="str-chat__message-team-error-header">
                    Only visible to you
                  </div>
                )}
              </div>

              <div
                className={
                  isOnlyEmojis(message.text)
                    ? 'str-chat__message-livestream-text--is-emoji'
                    : ''
                }
              >
                {message.type !== 'error' &&
                  message.status !== 'failed' &&
                  renderText(message.text)}

                {message.type === 'error' && !message.command && (
                  <p>
                    <svg
                      width="14"
                      height="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0zm.875 10.938a.438.438 0 0 1-.438.437h-.875a.438.438 0 0 1-.437-.438v-.874c0-.242.196-.438.438-.438h.875c.241 0 .437.196.437.438v.874zm0-2.626a.438.438 0 0 1-.438.438h-.875a.438.438 0 0 1-.437-.438v-5.25c0-.241.196-.437.438-.437h.875c.241 0 .437.196.437.438v5.25z"
                        fill="#EA152F"
                        fillRule="evenodd"
                      />
                    </svg>
                    {message.text}
                  </p>
                )}

                {message.type === 'error' && message.command && (
                  <p>
                    <svg
                      width="14"
                      height="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0zm.875 10.938a.438.438 0 0 1-.438.437h-.875a.438.438 0 0 1-.437-.438v-.874c0-.242.196-.438.438-.438h.875c.241 0 .437.196.437.438v.874zm0-2.626a.438.438 0 0 1-.438.438h-.875a.438.438 0 0 1-.437-.438v-5.25c0-.241.196-.437.438-.437h.875c.241 0 .437.196.437.438v5.25z"
                        fill="#EA152F"
                        fillRule="evenodd"
                      />
                    </svg>
                    <strong>/{message.command}</strong> is not a valid command
                  </p>
                )}
                {message.status === 'failed' && (
                  <p
                    onClick={this.props.handleRetry.bind(
                      this,
                      this.props.message,
                    )}
                  >
                    <svg
                      width="14"
                      height="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0zm.875 10.938a.438.438 0 0 1-.438.437h-.875a.438.438 0 0 1-.437-.438v-.874c0-.242.196-.438.438-.438h.875c.241 0 .437.196.437.438v.874zm0-2.626a.438.438 0 0 1-.438.438h-.875a.438.438 0 0 1-.437-.438v-5.25c0-.241.196-.437.438-.437h.875c.241 0 .437.196.437.438v5.25z"
                        fill="#EA152F"
                        fillRule="evenodd"
                      />
                    </svg>
                    Message failed. Click to try again.
                  </p>
                )}
              </div>

              {hasAttachment &&
                attachments.map((attachment, index) => (
                  <Attachment
                    key={`${message.id}-${index}`}
                    attachment={attachment}
                    actionHandler={this.props.handleAction}
                  />
                ))}

              {galleryImages.length !== 0 && <Gallery images={galleryImages} />}

              <SimpleReactionsList
                reaction_counts={message.reaction_counts}
                reactions={this.props.message.latest_reactions}
                handleReaction={this.props.handleReaction}
              />

              {!this.props.initialMessage && (
                <MessageRepliesCountButton
                  onClick={this.props.openThread}
                  reply_count={message.reply_count}
                />
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}