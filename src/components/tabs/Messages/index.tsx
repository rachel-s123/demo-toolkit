import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useConfig } from "../../../hooks/useConfig";
import {
  MotorcycleModel,
  ActionButtonType,
  MessageChannel,
  Message,
} from "../../../types";
import FilterGroup from "../../ui/FilterGroup";
import MessageCard from "./MessageCard";
import { useTranslations } from "../../../context/LanguageContext";
import { useHighlight } from "../../../context/HighlightContext";
import { useLanguage } from '../../../context/LanguageContext';
import ConfigService from '../../../services/configService';

const Messages: React.FC = () => {
  const { config, loading, error, refetch } = useConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useTranslations();
  const copy = t.messages;
  const { isHighlightEnabled } = useHighlight();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);

  // Always initialize filter state from URL params
  const getParam = (key: string, fallback: string) => searchParams.get(key) || fallback;
  const [modelFilter, setModelFilter] = useState<MotorcycleModel>(getParam("model", "ALL") as MotorcycleModel);
  const [stageFilter, setStageFilter] = useState<ActionButtonType | "ALL">(getParam("type", "ALL") as ActionButtonType | "ALL");
  const [channelFilter, setChannelFilter] = useState<MessageChannel | "ALL">(getParam("channel", "ALL") as MessageChannel | "ALL");

  // Sync filter state with URL params whenever they change
  useEffect(() => {
    const modelFromUrl = searchParams.get("model") as MotorcycleModel;
    const typeFromUrl = searchParams.get("type") as ActionButtonType;
    const channelFromUrl = searchParams.get("channel") as MessageChannel;

    if (modelFromUrl !== null && modelFromUrl !== modelFilter) {
      setModelFilter(modelFromUrl);
    }
    if (typeFromUrl !== null && typeFromUrl !== stageFilter) {
      setStageFilter(typeFromUrl);
    }
    if (channelFromUrl !== null && channelFromUrl !== channelFilter) {
      setChannelFilter(channelFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('Language changed:', language);
    const loadMessages = async () => {
      try {
        const configService = ConfigService.getInstance();
        const loadedMessages = await configService.loadMessageConfig(language);
        console.log('Loaded messages:', loadedMessages);
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [language]);

  const modelOptions = useMemo(
    () =>
      (config?.filterOptions.models as MotorcycleModel[] | undefined) || [
        "ALL",
      ],
    [config]
  );
  const stageOptions = useMemo(
    () =>
      (config?.filterOptions.actionTypes as ActionButtonType[] | undefined) || [
        "ALL",
      ],
    [config]
  );
  const channelOptions = useMemo(
    () =>
      (config?.filterOptions.channels as MessageChannel[] | undefined) || [
        "ALL",
      ],
    [config]
  );

  const filteredMessages = useMemo(() => {
    return messages.filter((message: Message) => {
      const matchesModel =
        modelFilter === "ALL" || message.model === modelFilter;
      const matchesStage =
        stageFilter === "ALL" || message.type === stageFilter;
      const matchesChannel =
        channelFilter === "ALL" || message.channel === channelFilter;
      return matchesModel && matchesStage && matchesChannel;
    });
  }, [messages, modelFilter, stageFilter, channelFilter]);

  const updateUrlParams = (param: string, value: string) => {
    if (value === "ALL") {
      searchParams.delete(param);
    } else {
      searchParams.set(param, value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleModelFilterChange = (filter: string) => {
    const typedFilter = filter as MotorcycleModel | "ALL";
    setModelFilter(typedFilter);
    updateUrlParams("model", typedFilter);
  };

  const handleStageFilterChange = (filter: string) => {
    const typedFilter = filter as ActionButtonType | "ALL";
    setStageFilter(typedFilter);
    updateUrlParams("type", typedFilter);
  };

  const handleChannelFilterChange = (filter: string) => {
    const typedFilter = filter as MessageChannel | "ALL";
    setChannelFilter(typedFilter);
    updateUrlParams("channel", typedFilter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading messages: {error || "Configuration not available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{ color: isHighlightEnabled ? "green" : "inherit" }}
        className="mb-6 text-2xl font-bold text-secondary-900"
      >
        {copy.title}
      </h1>

      <div className="mb-8 text-secondary-700 space-y-2">
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          {copy.introParagraph1}
        </p>
        <p style={{ color: isHighlightEnabled ? "green" : "inherit" }}>
          {copy.introParagraph2}
        </p>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
        <h3
          style={{ color: isHighlightEnabled ? "green" : "inherit" }}
          className="text-sm font-bold text-secondary-700 mb-3"
        >
          {copy.filterHeading}
        </h3>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <FilterGroup
            filterOptions={modelOptions as string[]}
            activeFilter={modelFilter}
            onFilterChange={handleModelFilterChange}
            label="Model"
          />
          <FilterGroup
            filterOptions={stageOptions as string[]}
            activeFilter={stageFilter}
            onFilterChange={handleStageFilterChange}
            label="Stage"
          />
          <FilterGroup
            filterOptions={channelOptions as string[]}
            activeFilter={channelFilter}
            onFilterChange={handleChannelFilterChange}
            label="Channel"
          />
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-secondary-500">
            No messages match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
