# Representative providers — source/config/API deep dives

All sections OBSERVED unless explicitly marked prior VALIDATED. Common registration: conventional module/class → factory catalog → GET /providers → metadata forms. Common install/provisioning is available only if the module can load; no runtime installation performed. Actions via /providers/{provider_id}/invoke/{method} differ from Step query/notify. Auth values below are field names/types/metadata, never credential values.

## datadog

Monitoring inbound via _format_alert/_get_alerts; topology via BaseTopologyProvider; _query handles query variants. api_key/app_key and optional OAuth token are sensitive; domain/environment specify deployment. PROVIDER_METHODS includes monitor mute/unmute, event/trace reads, and external incident create/resolve/timeline note. These incident actions do not make it a BaseIncidentProvider. Fingerprint defaults groups+monitor_id reused from previous runtime labs. setup_webhook configures remote integration. Workflow supports query; arbitrary special actions are a distinct invoke API surface, not proof of a _notify workflow action.

Source: `keep/keep/providers/datadog_provider/datadog_provider.py:182`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "api_key",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": true,
      "description": "Datadog Api Key",
      "hint": "https://docs.datadoghq.com/account_management/api-app-keys/#api-keys",
      "sensitive": true
    },
    "source": "keep/keep/providers/datadog_provider/datadog_provider.py:134"
  },
  {
    "name": "app_key",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": true,
      "description": "Datadog App Key",
      "hint": "https://docs.datadoghq.com/account_management/api-app-keys/#application-keys",
      "sensitive": true
    },
    "source": "keep/keep/providers/datadog_provider/datadog_provider.py:143"
  },
  {
    "name": "domain",
    "annotation": "HttpsUrl",
    "default": "https://api.datadoghq.com",
    "metadata": {
      "required": false,
      "description": "Datadog API domain",
      "sensitive": false,
      "hint": "https://api.datadoghq.com",
      "validation": "https_url"
    },
    "source": "keep/keep/providers/datadog_provider/datadog_provider.py:152"
  },
  {
    "name": "environment",
    "annotation": "str",
    "default": "*",
    "metadata": {
      "required": false,
      "description": "Topology environment name",
      "sensitive": false,
      "hint": "Defaults to *"
    },
    "source": "keep/keep/providers/datadog_provider/datadog_provider.py:162"
  },
  {
    "name": "oauth_token",
    "annotation": "dict",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "description": "For OAuth flow",
      "required": false,
      "sensitive": true,
      "hidden": true
    },
    "source": "keep/keep/providers/datadog_provider/datadog_provider.py:171"
  }
]
```

Capabilities and exact implementation anchors:
- `_query` — `keep/keep/providers/datadog_provider/datadog_provider.py:902`
- `_format_alert` — `keep/keep/providers/datadog_provider/datadog_provider.py:1317`
- `get_alerts_configuration` — `keep/keep/providers/datadog_provider/datadog_provider.py:930`
- `deploy_alert` — `keep/keep/providers/datadog_provider/datadog_provider.py:1404`
- `_get_alerts` — `keep/keep/providers/datadog_provider/datadog_provider.py:1015`
- `setup_webhook` — `keep/keep/providers/datadog_provider/datadog_provider.py:1211`
- `pull_topology` — `keep/keep/providers/datadog_provider/datadog_provider.py:1515`

Declared action metadata:
```json
[
  {
    "name": "Mute a Monitor",
    "func_name": "mute_monitor",
    "scopes": [
      "monitors_write"
    ],
    "description": "Mute a monitor",
    "type": "action"
  },
  {
    "name": "Unmute a Monitor",
    "func_name": "unmute_monitor",
    "scopes": [
      "monitors_write"
    ],
    "description": "Unmute a monitor",
    "type": "action"
  },
  {
    "name": "Get Monitor Events",
    "func_name": "get_monitor_events",
    "scopes": [
      "events_read"
    ],
    "description": "Get all events related to this monitor",
    "type": "view"
  },
  {
    "name": "Get a Trace",
    "func_name": "get_trace",
    "scopes": [
      "apm_read"
    ],
    "description": "Get trace by ID",
    "type": "view"
  },
  {
    "name": "Create Incident",
    "func_name": "create_incident",
    "scopes": [
      "incidents_write"
    ],
    "description": "Create an incident",
    "type": "action"
  },
  {
    "name": "Resolve Incident",
    "func_name": "resolve_incident",
    "scopes": [
      "incidents_write"
    ],
    "description": "Resolve an active incident",
    "type": "action"
  },
  {
    "name": "Add Incident Timeline Note",
    "func_name": "add_incident_timeline_note",
    "scopes": [
      "incidents_write"
    ],
    "description": "Add a note to an incident timeline",
    "type": "action"
  }
]
```

Canonical method signatures:
- `oauth2_logic(**payload)`
- `add_incident_timeline_note(self, incident_id: str, note: str)`
- `resolve_incident(self, incident_id: str)`
- `create_incident(self, incident_name: str, incident_message: str, commander_user: str, customer_impacted: bool=False, important: bool=True, severity: Literal['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4', 'UNKNOWN']='SEV-4', fields: dict={'state': {'value': 'active'}})`
- `mute_monitor(self, monitor_id: str, groups: list=[], end: datetime.datetime=datetime.datetime.now() + datetime.timedelta(days=1))`
- `unmute_monitor(self, monitor_id: str, groups: list=[])`
- `get_trace(self, trace_id: str)`
- `get_monitor_events(self, monitor_id: str)`
- `validate_config(self)`
- `validate_scopes(self)`
- `_query(self, query='', timeframe='', query_type='', **kwargs: dict)`
- `get_alerts_configuration(self, alert_id: str | None=None)`
- `_get_alerts(self)`
- `setup_webhook(self, tenant_id: str, keep_api_url: str, api_key: str, setup_alerts: bool=True)`
- `_format_alert(event: dict, provider_instance: 'BaseTopologyProvider'=None)`
- `deploy_alert(self, alert: dict, alert_id: str | None=None)`
- `pull_topology(self)`

Workflow: ['query step']. Prior runtime: VALIDATED_REUSED: ingestion/normalization/dedup LAB08/09 and correlation LAB10; no installed account/actions test. OEM: ADAPT — Data Collection / Event Gateway adapter (target proposal).

## webhook

Generic HTTP outbound _notify delegates to query; _query returns parsed response and accepts URL/method, basic credentials, bearer api_key, headers, body, params, fail_on_error. AuthConfig includes configured URL/method/verify and optional credentials/headers. No inbound _format_alert implementation: use POST /alerts/event for generic canonical input. URL substring blacklist includes localhost and metadata hosts; proposed experiment patches requests rather than bypassing the blacklist. _notify does not return query result, so do not expect wrapper enrichment from that action's return. Prefer _query when returned data is the assertion.

Source: `keep/keep/providers/webhook_provider/webhook_provider.py:91`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "url",
    "annotation": "pydantic.AnyHttpUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Webhook URL",
      "validation": "any_http_url"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:26"
  },
  {
    "name": "verify",
    "annotation": "bool",
    "default": true,
    "metadata": {
      "description": "Enable SSL verification",
      "hint": "Whether to verify the SSL certificate of the webhook URL or not",
      "type": "switch"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:34"
  },
  {
    "name": "method",
    "annotation": "typing.Literal['GET', 'POST', 'PUT', 'DELETE']",
    "default": "POST",
    "metadata": {
      "required": true,
      "description": "HTTP method",
      "type": "select",
      "options": [
        "POST",
        "GET",
        "PUT",
        "DELETE"
      ]
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:43"
  },
  {
    "name": "http_basic_authentication_username",
    "annotation": "typing.Optional[str]",
    "default": null,
    "metadata": {
      "description": "HTTP basic authentication - Username",
      "config_sub_group": "basic_authentication",
      "config_main_group": "authentication"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:53"
  },
  {
    "name": "http_basic_authentication_password",
    "annotation": "typing.Optional[str]",
    "default": null,
    "metadata": {
      "description": "HTTP basic authentication - Password",
      "sensitive": true,
      "config_sub_group": "basic_authentication",
      "config_main_group": "authentication"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:62"
  },
  {
    "name": "api_key",
    "annotation": "typing.Optional[str]",
    "default": null,
    "metadata": {
      "description": "API key",
      "sensitive": true,
      "config_sub_group": "api_key",
      "config_main_group": "authentication"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:72"
  },
  {
    "name": "headers",
    "annotation": "typing.Optional[list[dict[str, str]]]",
    "default": null,
    "metadata": {
      "description": "Headers",
      "type": "form"
    },
    "source": "keep/keep/providers/webhook_provider/webhook_provider.py:82"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/webhook_provider/webhook_provider.py:148`
- `_query` — `keep/keep/providers/webhook_provider/webhook_provider.py:169`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_scopes(self)`
- `validate_config(self)`
- `_notify(self, body: dict=None, params: dict=None, **kwargs)`
- `_query(self, url: str, method: typing.Literal['GET', 'POST', 'PUT', 'DELETE']='POST', http_basic_authentication_username: str=None, http_basic_authentication_password: str=None, api_key: str=None, headers: str=None, body: dict=None, params: dict=None, fail_on_error: bool=True, **kwargs: dict)`

Workflow: ['query step', 'notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Integration Worker / Notification Core Foundation (target proposal).

## zabbix

Monitoring alert pull + webhook formatter; JSON-RPC auth_token and zabbix_frontend_url, TLS verify configuration. FINGERPRINT_FIELDS=[id]. Explicit actions close_problem/change_severity/surrpress_problem/unsurrpress_problem/acknowledge_problem/unacknowledge_problem/add_message_to_problem and get_problem_messages. Preserve the exact misspelled function names in invoke contracts. No standard _query/_notify implementation observed; special invoke actions and ingestion are distinct. No BaseIncidentProvider. Remote setup_webhook is side-effecting.

Source: `keep/keep/providers/zabbix_provider/zabbix_provider.py:60`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "zabbix_frontend_url",
    "annotation": "pydantic.AnyHttpUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Zabbix Frontend URL",
      "hint": "https://zabbix.example.com",
      "sensitive": false,
      "validation": "any_http_url"
    },
    "source": "keep/keep/providers/zabbix_provider/zabbix_provider.py:33"
  },
  {
    "name": "auth_token",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Zabbix Auth Token",
      "hint": "Users -> Api tokens",
      "sensitive": true
    },
    "source": "keep/keep/providers/zabbix_provider/zabbix_provider.py:42"
  },
  {
    "name": "verify",
    "annotation": "bool",
    "default": true,
    "metadata": {
      "description": "Verify SSL certificates",
      "hint": "Set to false to allow self-signed certificates",
      "sensitive": false
    },
    "source": "keep/keep/providers/zabbix_provider/zabbix_provider.py:50"
  }
]
```

Capabilities and exact implementation anchors:
- `_format_alert` — `keep/keep/providers/zabbix_provider/zabbix_provider.py:720`
- `_get_alerts` — `keep/keep/providers/zabbix_provider/zabbix_provider.py:523`
- `setup_webhook` — `keep/keep/providers/zabbix_provider/zabbix_provider.py:568`

Declared action metadata:
```json
[
  {
    "name": "Close Problem",
    "func_name": "close_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Change Severity",
    "func_name": "change_severity",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Suppress Problem",
    "func_name": "surrpress_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Unsuppress Problem",
    "func_name": "unsurrpress_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Acknowledge Problem",
    "func_name": "acknowledge_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Unacknowledge Problem",
    "func_name": "unacknowledge_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Add Message to Problem",
    "func_name": "add_message_to_problem",
    "scopes": [
      "event.acknowledge"
    ],
    "type": "action"
  },
  {
    "name": "Get Problem Messages",
    "func_name": "get_problem_messages",
    "scopes": [
      "problem.get"
    ],
    "type": "view"
  }
]
```

Canonical method signatures:
- `close_problem(self, id: str)`
- `unsurrpress_problem(self, id: str)`
- `surrpress_problem(self, id: str, suppress_until: datetime.datetime=datetime.datetime.now() + datetime.timedelta(days=1))`
- `acknowledge_problem(self, id: str)`
- `unacknowledge_problem(self, id: str)`
- `add_message_to_problem(self, id: str, message_text: str)`
- `get_problem_messages(self, id: str)`
- `change_severity(self, id: str, new_severity: str)`
- `validate_config(self)`
- `validate_scopes(self)`
- `_get_alerts(self)`
- `setup_webhook(self, tenant_id: str, keep_api_url: str, api_key: str, setup_alerts: bool=True)`
- `_format_alert(event: dict, provider_instance: 'BaseProvider'=None)`

Workflow: ['Standard query/notify NOT_ESTABLISHED']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Data Collection / Event Gateway adapter (target proposal).

## prometheus

Monitoring pull/query plus Alertmanager webhook YAML template; URL/basic username/password and verify config. _query executes PromQL; _get_alerts ingests alerts; _format_alert translates Alertmanager payload and uses fingerprint. notify explicitly raises NotImplementedError; neither an outbound notifier nor a native Incident provider. UI webhook template availability is not a remote auto-installer. Distinct scrape/query contract can be deferred until pull/query coverage is required.

Source: `keep/keep/providers/prometheus_provider/prometheus_provider.py:54`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "url",
    "annotation": "pydantic.AnyHttpUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Prometheus server URL",
      "hint": "https://prometheus-us-central1.grafana.net/api/prom",
      "validation": "any_http_url"
    },
    "source": "keep/keep/providers/prometheus_provider/prometheus_provider.py:22"
  },
  {
    "name": "username",
    "annotation": "str",
    "default": "",
    "metadata": {
      "description": "Prometheus username",
      "sensitive": false
    },
    "source": "keep/keep/providers/prometheus_provider/prometheus_provider.py:30"
  },
  {
    "name": "password",
    "annotation": "str",
    "default": "",
    "metadata": {
      "description": "Prometheus password",
      "sensitive": true
    },
    "source": "keep/keep/providers/prometheus_provider/prometheus_provider.py:37"
  },
  {
    "name": "verify",
    "annotation": "bool",
    "default": true,
    "metadata": {
      "description": "Verify SSL certificates",
      "hint": "Set to false to allow self-signed certificates",
      "sensitive": false
    },
    "source": "keep/keep/providers/prometheus_provider/prometheus_provider.py:44"
  }
]
```

Capabilities and exact implementation anchors:
- `_query` — `keep/keep/providers/prometheus_provider/prometheus_provider.py:120`
- `_format_alert` — `keep/keep/providers/prometheus_provider/prometheus_provider.py:172`
- `_get_alerts` — `keep/keep/providers/prometheus_provider/prometheus_provider.py:153`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_config(self)`
- `validate_scopes(self)`
- `_query(self, query)`
- `_get_alerts(self)`
- `_format_alert(event: dict, provider_instance: 'BaseProvider'=None)`

Workflow: ['query step']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Data Collection / Event Gateway adapter (target proposal).

## servicenow

Ticketing plus BaseIncidentProvider and BaseTopologyProvider. Auth: service_now_base_url, username/password; optional client_id/client_secret activates OAuth password grant during construction. ticket_creation_url is UI metadata. _query reads tables; _notify(table_name,payload,**kwargs) creates a table record, or ticket_id/fingerprint select update path. Create expects 201, treats 200 as hibernating instance and returns sys_id/link; verify=False and missing timeout are observed issues. _get_incidents/_format_incident import IncidentDto; number determines fingerprint/deterministic ID, state/impact map lifecycle/severity. pull_topology imports CMDB relationships; activity get/add methods declared for UI invoke. Ticket create return is not automatically Keep incident import; explicit formatter/pull/event route or enrichment is required.

Source: `keep/keep/providers/servicenow_provider/servicenow_provider.py:86`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "service_now_base_url",
    "annotation": "HttpsUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "The base URL of the ServiceNow instance",
      "sensitive": false,
      "hint": "https://dev12345.service-now.com",
      "validation": "https_url"
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:30"
  },
  {
    "name": "username",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "The username of the ServiceNow user",
      "sensitive": false
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:40"
  },
  {
    "name": "password",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "The password of the ServiceNow user",
      "sensitive": true
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:48"
  },
  {
    "name": "client_id",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": false,
      "description": "The client ID to use OAuth 2.0 based authentication",
      "sensitive": false
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:57"
  },
  {
    "name": "client_secret",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": false,
      "description": "The client secret to use OAuth 2.0 based authentication",
      "sensitive": true
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:66"
  },
  {
    "name": "ticket_creation_url",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": false,
      "description": "URL for creating new tickets",
      "sensitive": false,
      "hint": "https://dev12345.service-now.com/now/sow/record/incident/-1"
    },
    "source": "keep/keep/providers/servicenow_provider/servicenow_provider.py:75"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/servicenow_provider/servicenow_provider.py:841`
- `_query` — `keep/keep/providers/servicenow_provider/servicenow_provider.py:279`
- `_get_incidents` — `keep/keep/providers/servicenow_provider/servicenow_provider.py:344`
- `_format_incident` — `keep/keep/providers/servicenow_provider/servicenow_provider.py:382`
- `pull_topology` — `keep/keep/providers/servicenow_provider/servicenow_provider.py:664`

Declared action metadata:
```json
[
  {
    "name": "Get Incidents",
    "func_name": "get_incidents",
    "scopes": [
      "itil"
    ],
    "description": "Fetch all incidents from ServiceNow",
    "type": "view"
  },
  {
    "name": "Get Incident Activities",
    "func_name": "get_incident_activities",
    "scopes": [
      "itil"
    ],
    "description": "Get work notes and comments from a ServiceNow incident",
    "type": "view"
  },
  {
    "name": "Add Incident Activity",
    "func_name": "add_incident_activity",
    "scopes": [
      "itil"
    ],
    "description": "Add a work note or comment to a ServiceNow incident",
    "type": "action"
  }
]
```

Canonical method signatures:
- `validate_scopes(self)`
- `validate_config(self)`
- `_query(self, table_name: str, incident_id: str=None, sysparm_limit: int=100, sysparm_offset: int=0, **kwargs: dict)`
- `_get_incidents(self)`
- `_format_incident(event: dict, provider_instance: 'ServicenowProvider'=None)`
- `get_incident_activities(self, incident_id: str, limit: int=50)`
- `add_incident_activity(self, incident_id: str, content: str, activity_type: str='work_notes')`
- `pull_topology(self)`
- `_notify(self, table_name: str, payload: dict={}, **kwargs: dict)`

Workflow: ['query step', 'notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Existing Management Core Foundation / ServiceNow; preserve Worker reliability.

## slack

Outbound messaging only. webhook_url or OAuth access_token; validate_config rejects absence of both. Although webhook_url metadata says required, runtime accepts access_token alternative. _notify sends text/blocks/attachments and can update/reply/react through token path; channel required with token. Incoming Slack webhook URL means incoming to Slack, not inbound into Keep. Returns notification metadata such as slack_timestamp. No alert/incident formatter or pull contract; workflow can use alert/incident context and optional enrichment. Explicit timeout is absent in inspected POST calls.

Source: `keep/keep/providers/slack_provider/slack_provider.py:43`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "webhook_url",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": true,
      "description": "Slack Webhook Url",
      "sensitive": true
    },
    "source": "keep/keep/providers/slack_provider/slack_provider.py:24"
  },
  {
    "name": "access_token",
    "annotation": "str",
    "default": "",
    "metadata": {
      "description": "For access token installation flow, use Keep UI",
      "required": false,
      "sensitive": true,
      "hidden": true
    },
    "source": "keep/keep/providers/slack_provider/slack_provider.py:32"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/slack_provider/slack_provider.py:140`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_config(self)`
- `oauth2_logic(**payload)`
- `_notify(self, message='', blocks=[], channel='', slack_timestamp='', thread_timestamp='', attachments=[], username='', notification_type='message', **kwargs: dict)`

Workflow: ['notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Integration Worker / Notification Core Foundation (target proposal).

## pagerduty

Incident/on-call bidirectional plus topology. routing_key chooses Events API v2 trigger/acknowledge/resolve via _send_alert; otherwise REST API incident operations via _trigger_incident (api_key/OAuth, service/requester context). _query retrieves by incident_id/incident_key or lists. _format_alert handles alert payload, _format_incident and _get_incidents implement native Incident import; setup_incident_webhook registers callbacks. Auth metadata does not flag routing_key sensitive. Distinguish dedup_key at remote Events API from Keep canonical fingerprint/import ID. Real account lifecycle, OAuth and webhook permissions remain pending.

Source: `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:71`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "routing_key",
    "annotation": "str | None",
    "default": null,
    "metadata": {
      "required": false,
      "description": "Routing Key (an integration or ruleset key)"
    },
    "source": "keep/keep/providers/pagerduty_provider/pagerduty_provider.py:37"
  },
  {
    "name": "api_key",
    "annotation": "str | None",
    "default": null,
    "metadata": {
      "required": false,
      "description": "Api Key (a user or team API key)",
      "sensitive": true
    },
    "source": "keep/keep/providers/pagerduty_provider/pagerduty_provider.py:44"
  },
  {
    "name": "oauth_data",
    "annotation": "dict",
    "default": "",
    "metadata": {
      "description": "For oauth flow",
      "required": false,
      "sensitive": true,
      "hidden": true
    },
    "source": "keep/keep/providers/pagerduty_provider/pagerduty_provider.py:52"
  },
  {
    "name": "service_id",
    "annotation": "str | None",
    "default": null,
    "metadata": {
      "required": false,
      "description": "Service Id (if provided, keep will only operate on this service)",
      "sensitive": false
    },
    "source": "keep/keep/providers/pagerduty_provider/pagerduty_provider.py:61"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:710`
- `_query` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:777`
- `_format_alert` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:786`
- `_get_incidents` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:1113`
- `_format_incident` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:1162`
- `setup_incident_webhook` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:628`
- `pull_topology` — `keep/keep/providers/pagerduty_provider/pagerduty_provider.py:1056`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_config(self)`
- `oauth2_logic(**payload)`
- `validate_scopes(self)`
- `setup_incident_webhook(self, tenant_id: str, keep_api_url: str, api_key: str, setup_alerts: bool=True)`
- `_notify(self, title: str='', dedup: str='', service_id: str='', routing_key: str='', requester: str='', incident_id: str='', event_type: typing.Literal['trigger', 'acknowledge', 'resolve'] | None=None, severity: typing.Literal['critical', 'error', 'warning', 'info'] | None=None, source: str='custom_event', priority: str='', status: typing.Literal['resolved', 'acknowledged']='', resolution: str='', client: str='', client_url: str='', **kwargs: dict)`
- `_query(self, incident_id: str=None, incident_key: str=None)`
- `_format_alert(event: dict, provider_instance: 'BaseProvider'=None, force_new_format: bool=False)`
- `pull_topology(self)`
- `_get_incidents(self)`
- `_format_incident(event: dict, provider_instance: 'BaseProvider'=None)`

Workflow: ['query step', 'notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Notification Core Foundation / GNM + Integration Worker (target proposal).

## jira

Jira Cloud ticketing outbound; email/api_token/host plus ticket_creation_url. _notify handles issue creation/update/transitions using project/issue fields; _query reads ticket/board data. Native Keep Incident import and inbound monitoring are not established. Generic Jira issue support is not proof of full Jira Service Management request types, approvals or SLA semantics; no dedicated JSM provider directory found.

Source: `keep/keep/providers/jira_provider/jira_provider.py:64`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "email",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Atlassian Jira Email",
      "sensitive": false,
      "documentation_url": "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/#Create-an-API-token"
    },
    "source": "keep/keep/providers/jira_provider/jira_provider.py:25"
  },
  {
    "name": "api_token",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Atlassian Jira API Token",
      "sensitive": true,
      "documentation_url": "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/#Create-an-API-token"
    },
    "source": "keep/keep/providers/jira_provider/jira_provider.py:34"
  },
  {
    "name": "host",
    "annotation": "HttpsUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Atlassian Jira Host",
      "sensitive": false,
      "documentation_url": "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/#Create-an-API-token",
      "hint": "https://keephq.atlassian.net",
      "validation": "https_url"
    },
    "source": "keep/keep/providers/jira_provider/jira_provider.py:42"
  },
  {
    "name": "ticket_creation_url",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": false,
      "description": "URL for creating new tickets (optional, will use default if not provided)",
      "sensitive": false,
      "hint": "https://keephq.atlassian.net/secure/CreateIssue.jspa"
    },
    "source": "keep/keep/providers/jira_provider/jira_provider.py:53"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/jira_provider/jira_provider.py:546`
- `_query` — `keep/keep/providers/jira_provider/jira_provider.py:652`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_scopes(self)`
- `validate_config(self)`
- `_notify(self, summary: str, description: str='', issue_type: str='', project_key: str='', board_name: str='', issue_id: str=None, labels: List[str]=None, components: List[str]=None, custom_fields: dict=None, transition_to: Optional[str]=None, **kwargs: dict)`
- `_query(self, ticket_id='', board_id='', **kwargs: dict)`

Workflow: ['query step', 'notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Management Core Foundation / Integration Worker (target proposal).

## jiraonprem

Jira on-prem ticketing counterpart using personal_access_token, host, ticket_creation_url and verify. _notify create/update; _query ticket/board reads. Preserve its auth/schema differences from Jira Cloud. No independent JSM-specific provider contract established.

Source: `keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:65`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "host",
    "annotation": "HttpsUrl",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Jira Host",
      "sensitive": false,
      "hint": "jira.onprem.com",
      "validation": "any_http_url"
    },
    "source": "keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:24"
  },
  {
    "name": "personal_access_token",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Jira PAT",
      "sensitive": true,
      "documentation_url": "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html"
    },
    "source": "keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:34"
  },
  {
    "name": "ticket_creation_url",
    "annotation": "str",
    "default": "",
    "metadata": {
      "required": false,
      "description": "URL for creating new tickets",
      "sensitive": false,
      "hint": "https://jira.onprem.com/secure/CreateIssue.jspa"
    },
    "source": "keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:43"
  },
  {
    "name": "verify",
    "annotation": "bool",
    "default": false,
    "metadata": {
      "required": false,
      "description": "Verify the Jira server's TLS certificate",
      "hint": "Disabled by default; enable if the server uses a trusted certificate",
      "type": "switch",
      "config_main_group": "authentication"
    },
    "source": "keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:53"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:513`
- `_query` — `keep/keep/providers/jiraonprem_provider/jiraonprem_provider.py:593`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_scopes(self)`
- `validate_config(self)`
- `_notify(self, summary: str, description: str='', issue_type: str='', project_key: str='', board_name: str='', issue_id: str=None, labels: List[str]=None, components: List[str]=None, custom_fields: dict=None, priority: str='Medium', **kwargs: dict)`
- `_query(self, ticket_id='', board_id='', **kwargs: dict)`

Workflow: ['query step', 'notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Management Core Foundation / Integration Worker (target proposal).

## telegram

Outbound Bot API messaging via sensitive bot_token; _notify uses chat_id plus message and options. Workflow notifications may render alert/incident context; no native import or incident/on-call aggregate contract established. A Telegram account/bot/chat is required for real delivery; proposed current experiment need not add this second notification target.

Source: `keep/keep/providers/telegram_provider/telegram_provider.py:33`. Catalog state: ELIGIBLE_BY_FACTORY_CONVENTION.

Auth schema:
```json
[
  {
    "name": "bot_token",
    "annotation": "str",
    "default": "DATACLASS_REQUIRED_OR_FACTORY",
    "metadata": {
      "required": true,
      "description": "Telegram Bot Token",
      "sensitive": true
    },
    "source": "keep/keep/providers/telegram_provider/telegram_provider.py:24"
  }
]
```

Capabilities and exact implementation anchors:
- `_notify` — `keep/keep/providers/telegram_provider/telegram_provider.py:55`

Declared action metadata:
```json
[]
```

Canonical method signatures:
- `validate_config(self)`
- `_notify(self, chat_id: str='', topic_id: Optional[int]=None, message: str='', reply_markup: Optional[dict[str, dict[str, any]]]=None, reply_markup_layout: Literal['horizontal', 'vertical']='horizontal', parse_mode: str=None, image_url: Optional[str]=None, caption_on_image: bool=False, **kwargs: dict)`

Workflow: ['notify action']. Prior runtime: NOT_ESTABLISHED_IN_LAB08_09_10_REUSE. OEM: ADAPT — Integration Worker / Notification Core Foundation (target proposal).
